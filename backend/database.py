import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

try:
    from sqlcipher3 import dbapi2 as sqlite3
    _HAS_SQLCIPHER = True
except Exception:
    import sqlite3  # fallback
    _HAS_SQLCIPHER = False

DB_FILE = os.getenv("DB_FILE", "guardcloud.db")
SQLCIPHER_KEY = os.getenv("SQLCIPHER_KEY")


def db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row

    # only apply key when using sqlcipher and key provided
    if _HAS_SQLCIPHER and SQLCIPHER_KEY:
        try:
            conn.execute(f"PRAGMA key = '{SQLCIPHER_KEY}';")
        except Exception:
            pass
    return conn


def Initialize_db():
    conn = db_connection()
    c = conn.cursor()

    c.execute(
        """
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            status INTEGER DEFAULT 0,
            timedout INTEGER DEFAULT 0,
            timedout_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    c.execute(
        """
        CREATE TABLE IF NOT EXISTS files(
            id INTEGER PRIMARY KEY,
            session_token TEXT NOT NULL,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            encrypted_file BLOB NOT NULL,
            encrypted_aes_key BLOB NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.commit()
    conn.close()


def store_message(session_token, sender, receiver, encrypted_file, encrypted_aes_key):
    conn = db_connection()
    c = conn.cursor()
    c.execute(
        """
        INSERT INTO files (session_token, sender, receiver, encrypted_file, encrypted_aes_key)
        VALUES (?, ?, ?, ?, ?)
        """,
        (session_token, sender, receiver, encrypted_file, encrypted_aes_key),
    )
    conn.commit()
    conn.close()


# backward-compat alias
store_file = store_message


def get_or_create_session_token(user1, user2):
    from security import generate_session_token

    users_tuple = tuple(sorted([user1, user2]))
    return generate_session_token(users_tuple)


def fetch_chat_history(user1, user2):
    session_token = get_or_create_session_token(user1, user2)
    conn = db_connection()
    c = conn.cursor()
    c.execute(
        """
        SELECT sender, receiver, encrypted_file, encrypted_aes_key, timestamp
        FROM files
        WHERE session_token = ?
        ORDER BY timestamp ASC
        """,
        (session_token,),
    )
    rows = c.fetchall()
    conn.close()

    return [
        {
            "sender": row["sender"],
            "receiver": row["receiver"],
            "encrypted_file": row["encrypted_file"],
            "encrypted_aes_key": row["encrypted_aes_key"],
            "timestamp": row["timestamp"],
        }
        for row in rows
    ]


def user_exists(username):
    conn = db_connection()
    c = conn.cursor()
    c.execute("SELECT 1 FROM users WHERE username = ?", (username,))
    user = c.fetchone()
    conn.close()
    return user is not None


def signup_db(username, password_hash):
    if user_exists(username):
        print(f"Username {username} already exists!")
        return False

    conn = db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password_hash))
    conn.commit()
    conn.close()
    print(f"User {username} created successfully!")
    return True


def login_db(username, password):
    from security import authentication

    conn = db_connection()
    c = conn.cursor()
    c.execute("SELECT password FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()

    if row and authentication(password, row["password"]):
        print(f"Login successful for {username}!")
        return True
    print("Invalid username or password.")
    return False


def user_online(username):
    conn = db_connection()
    c = conn.cursor()
    c.execute("SELECT status FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    return bool(row["status"])


def set_user_status(username, status):
    conn = db_connection()
    c = conn.cursor()
    c.execute("UPDATE users SET status = ? WHERE username = ?", (int(bool(status)), username))
    conn.commit()
    conn.close()


def fetch_all_users():
    conn = db_connection()
    c = conn.cursor()
    c.execute("SELECT username, status FROM users")
    rows = c.fetchall()
    conn.close()
    return [{"username": r["username"], "online": bool(r["status"])} for r in rows]


def is_suspended(username):
    conn = db_connection()
    c = conn.cursor()
    c.execute("SELECT timedout, timedout_time FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    if not row:
        conn.close()
        return False

    timedout = row["timedout"]
    timedout_time = row["timedout_time"]

    if int(timedout) == 1:
        try:
            suspended_time = datetime.strptime(timedout_time, "%Y-%m-%d %H:%M:%S.%f")
        except ValueError:
            suspended_time = datetime.strptime(timedout_time, "%Y-%m-%d %H:%M:%S")

        if datetime.now() < suspended_time:
            print(f"{username} is suspended until {suspended_time}")
            conn.close()
            return True
        else:
            c.execute("UPDATE users SET timedout = 0 WHERE username = ?", (username,))
            conn.commit()
            print(f"{username} timeout expired.")

    conn.close()
    return False


def suspend(username):
    conn = db_connection()
    c = conn.cursor()
    timeout_time = datetime.now() + timedelta(seconds=300)
    c.execute(
        "UPDATE users SET timedout = 1, timedout_time = ? WHERE username = ?",
        (timeout_time, username),
    )
    conn.commit()
    conn.close()


