from datetime import datetime, timedelta
from dotenv import load_dotenv
import re
import bcrypt
import jwt
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
TOKEN_EXPIRY_MINUTES = int(os.getenv("TOKEN_EXPIRY_MINUTES", "60"))

def create_jwt_token(username):
    """Create a JWT for the given username."""
    expiration = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)
    payload = {"sub": username, "exp": expiration}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_jwt_token(token):
    if not token:
        print("No token provided")
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def password_req(password):
    """Return an error string if password is weak, or [] if it's OK."""
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

    if corrections:
        return "Password needs " + ", ".join(corrections)
    return corrections

def hash_it(password):
    """Hash a plain-text password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def authentication(input_password, stored_hash):
    """Check if the input password matches the stored bcrypt hash."""
    return bcrypt.checkpw(input_password.encode("utf-8"), stored_hash.encode("utf-8"))
