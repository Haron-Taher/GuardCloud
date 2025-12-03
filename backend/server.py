from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request, Header, Response, Query
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import uvicorn
import mimetypes
from typing import Optional

from database import (
    Initialize_db,
    signup_db,
    login_db,
    save_file_metadata,
    get_user_files,
    get_file_by_id,
    get_user_info,
    update_user_email,
    update_user_password,
    rename_file,
    move_file,
    trash_file,
    restore_file,
    delete_file_permanent,
    search_files,
    get_trashed_files,
    create_folder,
    get_folders,
    get_folder_by_id,
    rename_folder,
    trash_folder,
    delete_folder_permanent,
    get_folder_path,
    create_share_link,
    get_share_link,
    get_file_share_links,
    increment_share_download,
    delete_share_link,
    log_activity,
    get_user_activity,
    get_storage_used,
    get_file_count,
)
from security import password_req, hash_it, create_jwt_token, verify_jwt_token, authentication

load_dotenv()

app = FastAPI(title="GuardCloud API", version="1.0.0")

# Allow frontend running on a different origin (adjust in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Where files are stored on disk
STORAGE_ROOT = Path(os.getenv("STORAGE_ROOT", "storage"))
STORAGE_ROOT.mkdir(parents=True, exist_ok=True)

# Storage limit per user (15GB default)
STORAGE_LIMIT = int(os.getenv("STORAGE_LIMIT", 15 * 1024 * 1024 * 1024))

# Initialize DB once
Initialize_db()


# ============== Helper Functions ==============

def get_current_user(authorization: str = Header(default=None)):
    """Extract and validate JWT from Authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = authorization.split(" ", 1)[1]
    username = verify_jwt_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return username


def get_client_ip(request: Request) -> str:
    """Get client IP address."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ============== Health Check ==============

@app.get("/health")
def health():
    return {"status": "ok"}


@app.head("/health")
def health_head():
    return Response(status_code=200)


# ============== Auth Endpoints ==============

@app.post("/auth/signup")
async def signup(request: Request):
    data = await request.json()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    email = data.get("email", "").strip() or None

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")

    # Check password strength
    corrections = password_req(password)
    if corrections:
        raise HTTPException(status_code=400, detail=corrections)

    hashed = hash_it(password)

    ok = signup_db(username, hashed, email)
    if not ok:
        raise HTTPException(status_code=409, detail="Username already exists")

    log_activity(username, "signup", ip_address=get_client_ip(request))
    return {"message": "User created. Please log in."}


@app.post("/auth/login")
async def login(request: Request):
    data = await request.json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    if not login_db(username, password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_jwt_token(username)
    user_info = get_user_info(username)
    
    log_activity(username, "login", ip_address=get_client_ip(request))
    
    return {
        "token": token,
        "user": user_info
    }


@app.get("/auth/me")
def get_me(current_user: str = Depends(get_current_user)):
    """Get current user info."""
    user_info = get_user_info(current_user)
    if not user_info:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Add storage stats
    user_info["storage_used"] = get_storage_used(current_user)
    user_info["storage_limit"] = STORAGE_LIMIT
    user_info["file_count"] = get_file_count(current_user)
    
    return user_info


@app.put("/auth/profile")
async def update_profile(request: Request, current_user: str = Depends(get_current_user)):
    """Update user profile."""
    data = await request.json()
    email = data.get("email", "").strip()
    
    if email:
        update_user_email(current_user, email)
    
    log_activity(current_user, "update_profile", ip_address=get_client_ip(request))
    return {"message": "Profile updated"}


@app.put("/auth/password")
async def change_password(request: Request, current_user: str = Depends(get_current_user)):
    """Change user password."""
    data = await request.json()
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current and new password are required")

    # Verify current password
    if not login_db(current_user, current_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # Check new password strength
    corrections = password_req(new_password)
    if corrections:
        raise HTTPException(status_code=400, detail=corrections)

    hashed = hash_it(new_password)
    update_user_password(current_user, hashed)
    
    log_activity(current_user, "change_password", ip_address=get_client_ip(request))
    return {"message": "Password changed successfully"}


# ============== File Endpoints ==============

@app.get("/files")
def list_files(
    folder_id: Optional[int] = Query(None),
    current_user: str = Depends(get_current_user)
):
    """List files in a folder."""
    files = get_user_files(current_user, folder_id)
    folders = get_folders(current_user, folder_id)
    
    # Get breadcrumb path
    path = []
    if folder_id:
        path = get_folder_path(folder_id, current_user)
    
    return {
        "files": files,
        "folders": folders,
        "path": path,
        "current_folder": folder_id
    }


@app.get("/files/search")
def search_user_files(
    q: str = Query(..., min_length=1),
    current_user: str = Depends(get_current_user)
):
    """Search files by name."""
    files = search_files(current_user, q)
    return {"files": files, "query": q}


@app.get("/files/trash")
def list_trash(current_user: str = Depends(get_current_user)):
    """List trashed files."""
    files = get_trashed_files(current_user)
    return {"files": files}


@app.post("/files/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    folder_id: Optional[int] = Query(None),
    current_user: str = Depends(get_current_user),
):
    """Upload a file."""
    # Check storage limit
    current_usage = get_storage_used(current_user)
    contents = await file.read()
    file_size = len(contents)
    
    if current_usage + file_size > STORAGE_LIMIT:
        raise HTTPException(status_code=413, detail="Storage limit exceeded")

    # Verify folder exists and belongs to user
    if folder_id:
        folder = get_folder_by_id(folder_id, current_user)
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")

    user_dir = STORAGE_ROOT / current_user
    user_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename if exists
    stored_path = user_dir / file.filename
    counter = 1
    original_name = file.filename
    while stored_path.exists():
        name, ext = os.path.splitext(original_name)
        stored_path = user_dir / f"{name}_{counter}{ext}"
        counter += 1

    stored_path.write_bytes(contents)

    # Detect mime type
    mime_type, _ = mimetypes.guess_type(file.filename)

    file_id = save_file_metadata(
        owner=current_user,
        filename=file.filename,
        stored_path=str(stored_path),
        size=file_size,
        mime_type=mime_type,
        folder_id=folder_id,
    )

    log_activity(
        current_user, "upload", 
        target_type="file", target_id=file_id, target_name=file.filename,
        ip_address=get_client_ip(request)
    )

    return {"message": "File uploaded", "file_id": file_id}


@app.get("/files/{file_id}")
def get_file_info(file_id: int, current_user: str = Depends(get_current_user)):
    """Get file details."""
    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    return {
        "id": row["id"],
        "filename": row["filename"],
        "size": row["size"],
        "mime_type": row["mime_type"],
        "folder_id": row["folder_id"],
        "is_trashed": bool(row["is_trashed"]),
    }


@app.get("/files/{file_id}/download")
def download_file(file_id: int, current_user: str = Depends(get_current_user)):
    """Download a file."""
    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    if row["is_trashed"]:
        raise HTTPException(status_code=400, detail="Cannot download trashed file")

    return FileResponse(
        path=row["stored_path"],
        filename=row["filename"],
        media_type=row["mime_type"] or "application/octet-stream",
    )


@app.get("/files/{file_id}/preview")
def preview_file(file_id: int, current_user: str = Depends(get_current_user)):
    """Preview a file (for images, text, etc.)."""
    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    mime_type = row["mime_type"] or "application/octet-stream"
    
    # For images and PDFs, return the file directly
    if mime_type.startswith("image/") or mime_type == "application/pdf":
        return FileResponse(
            path=row["stored_path"],
            media_type=mime_type,
        )
    
    # For text files, return content
    if mime_type.startswith("text/") or mime_type in ["application/json", "application/javascript"]:
        try:
            with open(row["stored_path"], "r", encoding="utf-8") as f:
                content = f.read(100000)  # Limit to 100KB
            return {"content": content, "mime_type": mime_type}
        except:
            raise HTTPException(status_code=400, detail="Cannot read file")
    
    raise HTTPException(status_code=400, detail="Preview not available for this file type")


@app.put("/files/{file_id}/rename")
async def rename_file_endpoint(
    file_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Rename a file."""
    data = await request.json()
    new_name = data.get("name", "").strip()
    
    if not new_name:
        raise HTTPException(status_code=400, detail="Name is required")

    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    old_name = row["filename"]
    if not rename_file(file_id, current_user, new_name):
        raise HTTPException(status_code=400, detail="Could not rename file")

    log_activity(
        current_user, "rename",
        target_type="file", target_id=file_id, target_name=new_name,
        details=f"Renamed from {old_name}",
        ip_address=get_client_ip(request)
    )

    return {"message": "File renamed"}


@app.put("/files/{file_id}/move")
async def move_file_endpoint(
    file_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Move a file to a different folder."""
    data = await request.json()
    folder_id = data.get("folder_id")  # None means root

    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    # Verify destination folder exists
    if folder_id:
        folder = get_folder_by_id(folder_id, current_user)
        if not folder:
            raise HTTPException(status_code=404, detail="Destination folder not found")

    if not move_file(file_id, current_user, folder_id):
        raise HTTPException(status_code=400, detail="Could not move file")

    log_activity(
        current_user, "move",
        target_type="file", target_id=file_id, target_name=row["filename"],
        ip_address=get_client_ip(request)
    )

    return {"message": "File moved"}


@app.post("/files/{file_id}/trash")
async def trash_file_endpoint(
    file_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Move a file to trash."""
    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    if not trash_file(file_id, current_user):
        raise HTTPException(status_code=400, detail="Could not trash file")

    log_activity(
        current_user, "trash",
        target_type="file", target_id=file_id, target_name=row["filename"],
        ip_address=get_client_ip(request)
    )

    return {"message": "File moved to trash"}


@app.post("/files/{file_id}/restore")
async def restore_file_endpoint(
    file_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Restore a file from trash."""
    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    if not restore_file(file_id, current_user):
        raise HTTPException(status_code=400, detail="Could not restore file")

    log_activity(
        current_user, "restore",
        target_type="file", target_id=file_id, target_name=row["filename"],
        ip_address=get_client_ip(request)
    )

    return {"message": "File restored"}


@app.delete("/files/{file_id}")
async def delete_file_endpoint(
    file_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Permanently delete a file."""
    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    filename = row["filename"]
    stored_path = delete_file_permanent(file_id, current_user)
    
    if stored_path:
        # Delete physical file
        try:
            os.remove(stored_path)
        except:
            pass

    log_activity(
        current_user, "delete",
        target_type="file", target_id=file_id, target_name=filename,
        ip_address=get_client_ip(request)
    )

    return {"message": "File deleted permanently"}


# ============== Folder Endpoints ==============

@app.post("/folders")
async def create_folder_endpoint(
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create a new folder."""
    data = await request.json()
    name = data.get("name", "").strip()
    parent_id = data.get("parent_id")

    if not name:
        raise HTTPException(status_code=400, detail="Folder name is required")

    # Verify parent folder exists
    if parent_id:
        parent = get_folder_by_id(parent_id, current_user)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent folder not found")

    folder_id = create_folder(current_user, name, parent_id)

    log_activity(
        current_user, "create_folder",
        target_type="folder", target_id=folder_id, target_name=name,
        ip_address=get_client_ip(request)
    )

    return {"message": "Folder created", "folder_id": folder_id}


@app.get("/folders/{folder_id}")
def get_folder_info(folder_id: int, current_user: str = Depends(get_current_user)):
    """Get folder details."""
    folder = get_folder_by_id(folder_id, current_user)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    return folder


@app.put("/folders/{folder_id}/rename")
async def rename_folder_endpoint(
    folder_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Rename a folder."""
    data = await request.json()
    new_name = data.get("name", "").strip()

    if not new_name:
        raise HTTPException(status_code=400, detail="Name is required")

    folder = get_folder_by_id(folder_id, current_user)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    old_name = folder["name"]
    if not rename_folder(folder_id, current_user, new_name):
        raise HTTPException(status_code=400, detail="Could not rename folder")

    log_activity(
        current_user, "rename",
        target_type="folder", target_id=folder_id, target_name=new_name,
        details=f"Renamed from {old_name}",
        ip_address=get_client_ip(request)
    )

    return {"message": "Folder renamed"}


@app.post("/folders/{folder_id}/trash")
async def trash_folder_endpoint(
    folder_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Move a folder to trash."""
    folder = get_folder_by_id(folder_id, current_user)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    trash_folder(folder_id, current_user)

    log_activity(
        current_user, "trash",
        target_type="folder", target_id=folder_id, target_name=folder["name"],
        ip_address=get_client_ip(request)
    )

    return {"message": "Folder moved to trash"}


@app.delete("/folders/{folder_id}")
async def delete_folder_endpoint(
    folder_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Permanently delete a folder."""
    folder = get_folder_by_id(folder_id, current_user)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    folder_name = folder["name"]
    file_paths = delete_folder_permanent(folder_id, current_user)

    # Delete physical files
    for path in file_paths:
        try:
            os.remove(path)
        except:
            pass

    log_activity(
        current_user, "delete",
        target_type="folder", target_id=folder_id, target_name=folder_name,
        ip_address=get_client_ip(request)
    )

    return {"message": "Folder deleted permanently"}


# ============== Share Endpoints ==============

@app.post("/files/{file_id}/share")
async def create_share(
    file_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create a share link for a file."""
    data = await request.json()
    password = data.get("password")
    expires_in_days = data.get("expires_in_days")
    max_downloads = data.get("max_downloads")

    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    password_hash = hash_it(password) if password else None
    token = create_share_link(
        file_id, current_user,
        password_hash=password_hash,
        expires_in_days=expires_in_days,
        max_downloads=max_downloads
    )

    log_activity(
        current_user, "share",
        target_type="file", target_id=file_id, target_name=row["filename"],
        ip_address=get_client_ip(request)
    )

    return {"token": token, "url": f"/share/{token}"}


@app.get("/files/{file_id}/shares")
def list_file_shares(file_id: int, current_user: str = Depends(get_current_user)):
    """List all share links for a file."""
    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    shares = get_file_share_links(file_id, current_user)
    return {"shares": shares}


@app.delete("/shares/{link_id}")
async def delete_share(
    link_id: int,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Delete a share link."""
    if not delete_share_link(link_id, current_user):
        raise HTTPException(status_code=404, detail="Share link not found")

    return {"message": "Share link deleted"}


# ============== Public Share Download ==============

@app.get("/share/{token}")
def get_shared_file_info(token: str):
    """Get info about a shared file (public)."""
    share = get_share_link(token)
    if not share:
        raise HTTPException(status_code=404, detail="Share link not found")

    # Check expiration
    if share["expires_at"]:
        from datetime import datetime
        if datetime.fromisoformat(share["expires_at"]) < datetime.now():
            raise HTTPException(status_code=410, detail="Share link has expired")

    # Check download limit
    if share["max_downloads"] and share["download_count"] >= share["max_downloads"]:
        raise HTTPException(status_code=410, detail="Download limit reached")

    return {
        "filename": share["filename"],
        "size": share["size"],
        "has_password": share["has_password"],
    }


@app.post("/share/{token}/download")
async def download_shared_file(token: str, request: Request):
    """Download a shared file (public)."""
    share = get_share_link(token)
    if not share:
        raise HTTPException(status_code=404, detail="Share link not found")

    # Check expiration
    if share["expires_at"]:
        from datetime import datetime
        if datetime.fromisoformat(share["expires_at"]) < datetime.now():
            raise HTTPException(status_code=410, detail="Share link has expired")

    # Check download limit
    if share["max_downloads"] and share["download_count"] >= share["max_downloads"]:
        raise HTTPException(status_code=410, detail="Download limit reached")

    # Check password if required
    if share["has_password"]:
        data = await request.json()
        password = data.get("password", "")
        if not authentication(password, share["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid password")

    # Increment download count
    increment_share_download(token)

    return FileResponse(
        path=share["stored_path"],
        filename=share["filename"],
        media_type=share["mime_type"] or "application/octet-stream",
    )


# ============== Activity Log ==============

@app.get("/activity")
def get_activity(
    limit: int = Query(50, ge=1, le=100),
    current_user: str = Depends(get_current_user)
):
    """Get user activity log."""
    activities = get_user_activity(current_user, limit)
    return {"activities": activities}


# ============== Storage Stats ==============

@app.get("/storage")
def get_storage_stats(current_user: str = Depends(get_current_user)):
    """Get storage statistics."""
    used = get_storage_used(current_user)
    file_count = get_file_count(current_user)
    
    return {
        "used": used,
        "limit": STORAGE_LIMIT,
        "available": STORAGE_LIMIT - used,
        "file_count": file_count,
        "percentage": round((used / STORAGE_LIMIT) * 100, 2) if STORAGE_LIMIT > 0 else 0
    }


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("server:app", host=host, port=port, reload=True)
