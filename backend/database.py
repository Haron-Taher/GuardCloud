from sqlcipher3 import dbapi2 as sqlite3
from security import authentication
from dotenv import load_dotenv
import os
import secrets
from datetime import datetime, timedelta

load_dotenv()
db_file = os.getenv("DB_FILE")

def db_connection():
    key = os.getenv("SQLCIPHER_KEY")
    if not key:
        raise RuntimeError("Missing SQLCIPHER_KEY environment variable")

    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    conn.execute(f"PRAGMA key = '{key}';")
    return conn


def Initialize_db():
    """Create the core tables if they don't already exist."""
    conn = db_connection()
    cursor = conn.cursor()

    # Users table for storing credentials
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Files table for storing file metadata
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS files(
            id INTEGER PRIMARY KEY,
            owner TEXT NOT NULL,
            filename TEXT NOT NULL,
            stored_path TEXT NOT NULL,
            size INTEGER NOT NULL,
            mime_type TEXT,
            folder_id INTEGER,
            is_trashed INTEGER DEFAULT 0,
            trashed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (folder_id) REFERENCES folders(id)
        )
        """
    )

    # Folders table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS folders(
            id INTEGER PRIMARY KEY,
            owner TEXT NOT NULL,
            name TEXT NOT NULL,
            parent_id INTEGER,
            is_trashed INTEGER DEFAULT 0,
            trashed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES folders(id)
        )
        """
    )

    # Share links table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS share_links(
            id INTEGER PRIMARY KEY,
            file_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            expires_at DATETIME,
            max_downloads INTEGER,
            download_count INTEGER DEFAULT 0,
            created_by TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (file_id) REFERENCES files(id)
        )
        """
    )

    # Activity log table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS activity_log(
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            action TEXT NOT NULL,
            target_type TEXT,
            target_id INTEGER,
            target_name TEXT,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.commit()
    conn.close()


# ============== User Functions ==============

def user_exists(username):
    """Return True if a username already exists."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    return user is not None


def signup_db(username, password_hash, email=None):
    """Insert a new user if the username does not already exist."""
    if user_exists(username):
        print(f"Username {username} already exists!")
        return False

    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
        (username, password_hash, email),
    )
    conn.commit()
    conn.close()

    print(f"User {username} created successfully!")
    return True


def login_db(username, password):
    """Authenticates a user by checking if the credentials are valid"""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and authentication(password, user["password"]):
        print(f"Login successful for {username}!")
        return True

    print("Invalid username or password.")
    return False


def get_user_info(username):
    """Get user profile information."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, email, created_at FROM users WHERE username = ?",
        (username,),
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"],
        }
    return None


def update_user_email(username, email):
    """Update user email."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?",
        (email, username),
    )
    conn.commit()
    conn.close()
    return True


def update_user_password(username, password_hash):
    """Update user password."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?",
        (password_hash, username),
    )
    conn.commit()
    conn.close()
    return True


# ============== File Functions ==============

def save_file_metadata(owner, filename, stored_path, size, mime_type=None, folder_id=None):
    """Store a file record for the given user."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO files (owner, filename, stored_path, size, mime_type, folder_id)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (owner, filename, stored_path, size, mime_type, folder_id),
    )
    file_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return file_id


def get_user_files(owner, folder_id=None, include_trashed=False):
    """Return a list of files for a given user in a specific folder."""
    conn = db_connection()
    cursor = conn.cursor()
    
    if include_trashed:
        if folder_id is None:
            cursor.execute(
                """SELECT id, filename, size, mime_type, folder_id, is_trashed, created_at, updated_at
                   FROM files
                   WHERE owner = ? AND folder_id IS NULL
                   ORDER BY created_at DESC""",
                (owner,),
            )
        else:
            cursor.execute(
                """SELECT id, filename, size, mime_type, folder_id, is_trashed, created_at, updated_at
                   FROM files
                   WHERE owner = ? AND folder_id = ?
                   ORDER BY created_at DESC""",
                (owner, folder_id),
            )
    else:
        if folder_id is None:
            cursor.execute(
                """SELECT id, filename, size, mime_type, folder_id, is_trashed, created_at, updated_at
                   FROM files
                   WHERE owner = ? AND folder_id IS NULL AND is_trashed = 0
                   ORDER BY created_at DESC""",
                (owner,),
            )
        else:
            cursor.execute(
                """SELECT id, filename, size, mime_type, folder_id, is_trashed, created_at, updated_at
                   FROM files
                   WHERE owner = ? AND folder_id = ? AND is_trashed = 0
                   ORDER BY created_at DESC""",
                (owner, folder_id),
            )
    
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "filename": row["filename"],
            "size": row["size"],
            "mime_type": row["mime_type"],
            "folder_id": row["folder_id"],
            "is_trashed": bool(row["is_trashed"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }
        for row in rows
    ]


def get_trashed_files(owner):
    """Return all trashed files for a user."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, filename, size, mime_type, folder_id, trashed_at, created_at
           FROM files
           WHERE owner = ? AND is_trashed = 1
           ORDER BY trashed_at DESC""",
        (owner,),
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "filename": row["filename"],
            "size": row["size"],
            "mime_type": row["mime_type"],
            "folder_id": row["folder_id"],
            "trashed_at": row["trashed_at"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def get_file_by_id(file_id, owner):
    """Return a single file row for this user, or None."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, owner, filename, stored_path, size, mime_type, folder_id, is_trashed
           FROM files
           WHERE id = ? AND owner = ?""",
        (file_id, owner),
    )
    row = cursor.fetchone()
    conn.close()
    return row


def rename_file(file_id, owner, new_filename):
    """Rename a file."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE files 
           SET filename = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ? AND owner = ?""",
        (new_filename, file_id, owner),
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def move_file(file_id, owner, folder_id):
    """Move a file to a different folder."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE files 
           SET folder_id = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ? AND owner = ?""",
        (folder_id, file_id, owner),
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def trash_file(file_id, owner):
    """Move a file to trash."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE files 
           SET is_trashed = 1, trashed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ? AND owner = ?""",
        (file_id, owner),
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def restore_file(file_id, owner):
    """Restore a file from trash."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE files 
           SET is_trashed = 0, trashed_at = NULL, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ? AND owner = ?""",
        (file_id, owner),
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def delete_file_permanent(file_id, owner):
    """Permanently delete a file from database."""
    conn = db_connection()
    cursor = conn.cursor()
    
    # First get the file info
    cursor.execute(
        "SELECT stored_path FROM files WHERE id = ? AND owner = ?",
        (file_id, owner),
    )
    row = cursor.fetchone()
    
    if row:
        # Delete from database
        cursor.execute(
            "DELETE FROM files WHERE id = ? AND owner = ?",
            (file_id, owner),
        )
        # Also delete any share links
        cursor.execute(
            "DELETE FROM share_links WHERE file_id = ?",
            (file_id,),
        )
        conn.commit()
        conn.close()
        return row["stored_path"]
    
    conn.close()
    return None


def search_files(owner, query):
    """Search files by filename."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, filename, size, mime_type, folder_id, created_at
           FROM files
           WHERE owner = ? AND is_trashed = 0 AND filename LIKE ?
           ORDER BY created_at DESC
           LIMIT 50""",
        (owner, f"%{query}%"),
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "filename": row["filename"],
            "size": row["size"],
            "mime_type": row["mime_type"],
            "folder_id": row["folder_id"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


# ============== Folder Functions ==============

def create_folder(owner, name, parent_id=None):
    """Create a new folder."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO folders (owner, name, parent_id)
           VALUES (?, ?, ?)""",
        (owner, name, parent_id),
    )
    folder_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return folder_id


def get_folders(owner, parent_id=None):
    """Get folders for a user in a specific parent folder."""
    conn = db_connection()
    cursor = conn.cursor()
    
    if parent_id is None:
        cursor.execute(
            """SELECT id, name, parent_id, created_at
               FROM folders
               WHERE owner = ? AND parent_id IS NULL AND is_trashed = 0
               ORDER BY name""",
            (owner,),
        )
    else:
        cursor.execute(
            """SELECT id, name, parent_id, created_at
               FROM folders
               WHERE owner = ? AND parent_id = ? AND is_trashed = 0
               ORDER BY name""",
            (owner, parent_id),
        )
    
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "name": row["name"],
            "parent_id": row["parent_id"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def get_folder_by_id(folder_id, owner):
    """Get a specific folder."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, name, parent_id, created_at
           FROM folders
           WHERE id = ? AND owner = ?""",
        (folder_id, owner),
    )
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row["id"],
            "name": row["name"],
            "parent_id": row["parent_id"],
            "created_at": row["created_at"],
        }
    return None


def rename_folder(folder_id, owner, new_name):
    """Rename a folder."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE folders 
           SET name = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ? AND owner = ?""",
        (new_name, folder_id, owner),
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def trash_folder(folder_id, owner):
    """Move a folder and its contents to trash."""
    conn = db_connection()
    cursor = conn.cursor()
    
    # Trash the folder
    cursor.execute(
        """UPDATE folders 
           SET is_trashed = 1, trashed_at = CURRENT_TIMESTAMP 
           WHERE id = ? AND owner = ?""",
        (folder_id, owner),
    )
    
    # Trash all files in the folder
    cursor.execute(
        """UPDATE files 
           SET is_trashed = 1, trashed_at = CURRENT_TIMESTAMP 
           WHERE folder_id = ? AND owner = ?""",
        (folder_id, owner),
    )
    
    conn.commit()
    conn.close()
    return True


def delete_folder_permanent(folder_id, owner):
    """Permanently delete a folder."""
    conn = db_connection()
    cursor = conn.cursor()
    
    # Get all files in the folder
    cursor.execute(
        "SELECT stored_path FROM files WHERE folder_id = ? AND owner = ?",
        (folder_id, owner),
    )
    file_paths = [row["stored_path"] for row in cursor.fetchall()]
    
    # Delete files from database
    cursor.execute(
        "DELETE FROM files WHERE folder_id = ? AND owner = ?",
        (folder_id, owner),
    )
    
    # Delete the folder
    cursor.execute(
        "DELETE FROM folders WHERE id = ? AND owner = ?",
        (folder_id, owner),
    )
    
    conn.commit()
    conn.close()
    return file_paths


def get_folder_path(folder_id, owner):
    """Get the full path of a folder (breadcrumb)."""
    path = []
    conn = db_connection()
    cursor = conn.cursor()
    
    current_id = folder_id
    while current_id is not None:
        cursor.execute(
            "SELECT id, name, parent_id FROM folders WHERE id = ? AND owner = ?",
            (current_id, owner),
        )
        row = cursor.fetchone()
        if row:
            path.insert(0, {"id": row["id"], "name": row["name"]})
            current_id = row["parent_id"]
        else:
            break
    
    conn.close()
    return path


# ============== Share Functions ==============

def create_share_link(file_id, created_by, password_hash=None, expires_in_days=None, max_downloads=None):
    """Create a share link for a file."""
    token = secrets.token_urlsafe(32)
    expires_at = None
    
    if expires_in_days:
        expires_at = (datetime.now() + timedelta(days=expires_in_days)).isoformat()
    
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO share_links (file_id, token, password_hash, expires_at, max_downloads, created_by)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (file_id, token, password_hash, expires_at, max_downloads, created_by),
    )
    conn.commit()
    conn.close()
    return token


def get_share_link(token):
    """Get share link info by token."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT sl.*, f.filename, f.size, f.stored_path, f.mime_type
           FROM share_links sl
           JOIN files f ON sl.file_id = f.id
           WHERE sl.token = ?""",
        (token,),
    )
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row["id"],
            "file_id": row["file_id"],
            "token": row["token"],
            "has_password": row["password_hash"] is not None,
            "password_hash": row["password_hash"],
            "expires_at": row["expires_at"],
            "max_downloads": row["max_downloads"],
            "download_count": row["download_count"],
            "filename": row["filename"],
            "size": row["size"],
            "stored_path": row["stored_path"],
            "mime_type": row["mime_type"],
        }
    return None


def get_file_share_links(file_id, owner):
    """Get all share links for a file."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT sl.id, sl.token, sl.expires_at, sl.max_downloads, sl.download_count, sl.created_at,
                  (sl.password_hash IS NOT NULL) as has_password
           FROM share_links sl
           JOIN files f ON sl.file_id = f.id
           WHERE sl.file_id = ? AND f.owner = ?
           ORDER BY sl.created_at DESC""",
        (file_id, owner),
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "token": row["token"],
            "has_password": bool(row["has_password"]),
            "expires_at": row["expires_at"],
            "max_downloads": row["max_downloads"],
            "download_count": row["download_count"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def increment_share_download(token):
    """Increment download count for a share link."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE share_links SET download_count = download_count + 1 WHERE token = ?",
        (token,),
    )
    conn.commit()
    conn.close()


def delete_share_link(link_id, owner):
    """Delete a share link."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """DELETE FROM share_links 
           WHERE id = ? AND file_id IN (SELECT id FROM files WHERE owner = ?)""",
        (link_id, owner),
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


# ============== Activity Log Functions ==============

def log_activity(username, action, target_type=None, target_id=None, target_name=None, details=None, ip_address=None):
    """Log a user activity."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO activity_log (username, action, target_type, target_id, target_name, details, ip_address)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (username, action, target_type, target_id, target_name, details, ip_address),
    )
    conn.commit()
    conn.close()


def get_user_activity(username, limit=50):
    """Get recent activity for a user."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, action, target_type, target_id, target_name, details, created_at
           FROM activity_log
           WHERE username = ?
           ORDER BY created_at DESC
           LIMIT ?""",
        (username, limit),
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "action": row["action"],
            "target_type": row["target_type"],
            "target_id": row["target_id"],
            "target_name": row["target_name"],
            "details": row["details"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


# ============== Storage Stats ==============

def get_storage_used(owner):
    """Get total storage used by a user."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COALESCE(SUM(size), 0) as total FROM files WHERE owner = ? AND is_trashed = 0",
        (owner,),
    )
    row = cursor.fetchone()
    conn.close()
    return row["total"] if row else 0


def get_file_count(owner):
    """Get total file count for a user."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) as count FROM files WHERE owner = ? AND is_trashed = 0",
        (owner,),
    )
    row = cursor.fetchone()
    conn.close()
    return row["count"] if row else 0
