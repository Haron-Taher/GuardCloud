# GuardCloud Security
# Handles password hashing, JWT tokens, and authentication
#
# This security file supports the following Functional Requirements:
# FR-2: User authentication (login/signup) via JWT tokens and password hashing
# FR-6: Data encryption in transit via secure token-based authentication
# FR-20: Logout via token expiration (TOKEN_EXPIRY_MINUTES)

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
    """Create a JWT token for a logged in user."""
    expiration = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)
    payload = {"sub": username, "exp": expiration}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_jwt_token(token):
    """Check if a JWT token is valid and not expired. Returns username or None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def password_req(password):
    """Check password strength. Returns error message or empty list if OK."""
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
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def authentication(input_password, stored_hash):
    """Verify a password against its stored hash."""
    return bcrypt.checkpw(input_password.encode("utf-8"), stored_hash.encode("utf-8"))
