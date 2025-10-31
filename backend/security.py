from datetime import datetime, timedelta
from dotenv import load_dotenv
import re
import bcrypt
import jwt
import hmac
import hashlib
import os
import requests

load_dotenv()

SESSION_SECRET = os.getenv("SECRET_KEY", "dev-secret")
SECRET_KEY = os.getenv("SESSION_SECRET", "dev-session")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRY_MINUTES = int(os.getenv("TOKEN_EXPIRY_MINUTES", "60"))
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET", "")


def verify_recaptcha(token: str) -> bool:
    if not RECAPTCHA_SECRET or not token:
        return False
    try:
        r = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={"secret": RECAPTCHA_SECRET, "response": token},
            timeout=5,
        )
        return r.ok and r.json().get("success", False)
    except Exception:
        return False


def create_jwt_token(username):
    expiration = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)
    payload = {"sub": username, "exp": expiration}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_jwt_token(token):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None


def password_req(password):
    corrections = []
    if len(password) < 12:
        corrections.append("at least 12 characters")
    if not re.search(r"[a-z]", password):
        corrections.append("at least one lowercase letter")
    if not re.search(r"[A-Z]", password):
        corrections.append("at least one uppercase letter")
    if not re.search(r"\d", password):
        corrections.append("at least one digit")
    if re.search(r"\s", password):
        corrections.append("no whitespace allowed")
    if not re.search(r"[$@!&_-]", password):
        corrections.append("at least one special character")
    return ("Password needs " + ", ".join(corrections)) if corrections else []


def hash_it(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def authentication(input_pw, stored_hash):
    try:
        return bcrypt.checkpw(input_pw.encode("utf-8"), stored_hash.encode("utf-8"))
    except Exception:
        return False


def generate_session_token(users, group_name=None):
    sorted_users = sorted(users)
    joint_users = "_".join(sorted_users)
    if group_name:
        joint_users = f"{group_name}_{joint_users}"
    session_key = joint_users.encode("utf-8")
    token = hmac.new(SESSION_SECRET.encode("utf-8"), session_key, hashlib.sha256).hexdigest()
    return token


def verify_session_token(users, token, group_name=None):
    expected = generate_session_token(users, group_name)
    return hmac.compare_digest(expected, token)
