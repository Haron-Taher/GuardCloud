from sqlcipher3 import dbapi2 as sqlite3
from security import authentication
from dotenv import load_dotenv
import os

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
            email TEXT
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.commit()
    conn.close()

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
    """ Authenticates a user by checking if the credentials are vaild"""
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

def save_file_metadata(owner, filename, stored_path, size):
    """Store a file record for the given user."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO files (owner, filename, stored_path, size)
           VALUES (?, ?, ?, ?)""",
        (owner, filename, stored_path, size),
    )
    conn.commit()
    conn.close()

def get_user_files(owner):
    """Return a list of files for a given user."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, filename, size, created_at
           FROM files
           WHERE owner = ?
           ORDER BY created_at DESC""",
        (owner,),
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "filename": row["filename"],
            "size": row["size"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]

def get_file_by_id(file_id, owner):
    """Return a single file row for this user, or None."""
    conn = db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT id, owner, filename, stored_path, size
           FROM files
           WHERE id = ? AND owner = ?""",
        (file_id, owner),
    )
    row = cursor.fetchone()
    conn.close()
    return row
