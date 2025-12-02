from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request, Header, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import uvicorn

from database import (
    Initialize_db,
    signup_db,
    login_db,
    save_file_metadata,
    get_user_files,
    get_file_by_id,
)
from security import password_req, hash_it, create_jwt_token, verify_jwt_token

load_dotenv()

app = FastAPI()

# Allow frontend running on a different origin (adjust in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten later if you want
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Where files are stored on disk
STORAGE_ROOT = Path(os.getenv("STORAGE_ROOT", "storage"))
STORAGE_ROOT.mkdir(parents=True, exist_ok=True)

# Initialize DB once
Initialize_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.head("/health")
def health_head():
    return Response(status_code=200)


def get_current_user(authorization=Header(default=None)):
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


@app.post("/auth/signup")
async def signup(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    # Check password strength
    corrections = password_req(password)
    if corrections:
        raise HTTPException(status_code=400, detail=corrections)

    hashed = hash_it(password)

    ok = signup_db(username, hashed, email)
    if not ok:
        # signup_db already prints details; just return generic error to client
        raise HTTPException(status_code=400, detail="Could not create user")

    return {"message": "User created. Please log in."}


@app.post("/auth/login")
async def login(request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    if not login_db(username, password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_jwt_token(username)
    return {"token": token}


@app.get("/files")
def list_files(current_user=Depends(get_current_user)):
    files = get_user_files(current_user)
    return {"files": files}


@app.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    user_dir = STORAGE_ROOT / current_user
    user_dir.mkdir(parents=True, exist_ok=True)

    contents = await file.read()
    stored_path = user_dir / file.filename
    stored_path.write_bytes(contents)

    save_file_metadata(
        owner=current_user,
        filename=file.filename,
        stored_path=str(stored_path),
        size=len(contents),
    )

    return {"message": "File uploaded"}


@app.get("/files/{file_id}/download")
def download_file(file_id: int, current_user=Depends(get_current_user)):
    row = get_file_by_id(file_id, current_user)
    if not row:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=row["stored_path"],
        filename=row["filename"],
        media_type="application/octet-stream",
    )


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("server:app", host=host, port=port, reload=True)
