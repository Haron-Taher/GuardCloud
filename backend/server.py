from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from collections import deque
from datetime import datetime
from typing import Dict, Optional
import json
import os
import time
import uvicorn

# available for later use
from security import (
    password_req,
    hash_it,
    verify_jwt_token,          # kept for future messaging usage
    create_jwt_token,
    verify_recaptcha
)

from database import (
    Initialize_db,
    signup_db,
    login_db,
    user_exists,
    is_suspended,
    suspend,
    set_user_status,
    fetch_all_users,
    get_or_create_session_token,
    store_message,
    fetch_chat_history,
)


load_dotenv()

HOST = os.getenv("HOST", "127.0.0.1")

PORT = int(os.getenv("PORT", "8000"))


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ensure DB init no matter how the app is launched
@app.on_event("startup")
async def _startup_init_db():
    Initialize_db()


connected_users: Dict[str, WebSocket] = {}

message_tracker: Dict[str, deque] = {}


class _DummyWS:
    async def send_text(self, *args, **kwargs):
        return None

    async def close(self, *args, **kwargs):
        return None


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.head("/health")
async def health_head():
    return Response(status_code=200)


async def broadcast_user_list():
    users = fetch_all_users()
    payload = json.dumps({"action": "user_list", "users": users})

    for ws in list(connected_users.values()):
        try:
            await ws.send_text(payload)
        except Exception:
            pass


async def signup_user_ws(websocket: WebSocket, data: dict) -> bool:
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        await websocket.send_text(json.dumps({"error": "Missing username or password"}))
        return False

    corrections = password_req(password)
    if corrections:
        await websocket.send_text(json.dumps({"error": corrections}))
        return False

    pw_hash = hash_it(password)
    ok = signup_db(username, pw_hash)

    if ok:
        await websocket.send_text(json.dumps({"success": "User created. Please log in."}))
        return True

    await websocket.send_text(json.dumps({"error": "Username already exists!"}))
    return False


async def login_user_ws(websocket: WebSocket, data: dict) -> Optional[str]:
    MAX_ATTEMPTS = 10

    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        await websocket.send_text(json.dumps({"error": "Missing username or password"}))
        return None

    if not user_exists(username):
        await websocket.send_text(json.dumps({"error": "Username does not exist!"}))
        return None

    if is_suspended(username):
        await websocket.send_text(json.dumps({"error": "Your account is currently suspended, please wait."}))
        await websocket.close()
        return None

    key = f"attempts:{username}"
    bucket = message_tracker.setdefault(key, deque())

    now = time.time()
    while bucket and bucket[0] < now - 300:
        bucket.popleft()

    if len(bucket) >= MAX_ATTEMPTS:
        suspend(username)
        await websocket.send_text(json.dumps({"error": "Too many attempts. Account locked for 5 minutes."}))
        await websocket.close()
        return None

    if login_db(username, password):
        set_user_status(username, 1)
        await websocket.send_text(json.dumps({"message": "Login successful", "user": username}))
        return username

    bucket.append(now)
    left = MAX_ATTEMPTS - len(bucket)
    await websocket.send_text(json.dumps({"error": f"Invalid username or password. {max(left, 0)} attempts left."}))
    return None


@app.post("/auth/signup")
async def http_signup(payload: dict):
    ok = await signup_user_ws(_DummyWS(), payload)

    if ok:
        return {"success": True}

    raise HTTPException(status_code=400, detail="signup failed")


@app.post("/auth/login")
async def http_login(payload: dict):
    user = await login_user_ws(_DummyWS(), payload)

    if user:
        return {"success": True, "user": user}

    raise HTTPException(status_code=401, detail="invalid credentials")


async def chat_message(websocket: WebSocket, data: dict):
    token = data.get("token")
    receiver = data.get("receiver")
    encrypted_message = data.get("encrypted_message")
    encrypted_aes_key = data.get("encrypted_aes_key")
    sender = verify_jwt_token(token)

    if isinstance(encrypted_aes_key, dict):
        encrypted_aes_key = json.dumps(encrypted_aes_key)

    if not token or not encrypted_message or not encrypted_aes_key or not receiver:
        await websocket.send_text(json.dumps({"error": "Invalid request"}))
        return False

    if not sender:
        await websocket.send_text(json.dumps({"error": "Invalid or expired token"}))
        return False

    if receiver not in connected_users:
        await websocket.send_text(json.dumps({"error": f"{receiver} is offline or does not exist."}))
        return False

    session_token = get_or_create_session_token(sender, receiver)
    store_message(session_token, sender, receiver, encrypted_message, encrypted_aes_key)

    now = time.time()
    mt = message_tracker.setdefault(sender, deque())

    while mt and mt[0] < now - 1:
        mt.popleft()

    if len(mt) >= 2:
        await websocket.send_text(json.dumps({"error": "Rate limit exceeded. Try again later."}))
        return False

    mt.append(now)

    payload = json.dumps({
        "action": "message",
        "from": sender,
        "encrypted_message": encrypted_message,
        "encrypted_aes_key": encrypted_aes_key,
        "session_token": session_token,
    })

    try:
        await connected_users[receiver].send_text(payload)
    except Exception as e:
        await websocket.send_text(json.dumps({"error": f"Could not send to {receiver}: {str(e)}"}))
        return False

    try:
        await websocket.send_text(payload)
    except Exception:
        pass

    return True


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    username: Optional[str] = None

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            action = data.get("action")

            if action == "signup":
                await signup_user_ws(websocket, data)

            elif action == "login":
                user = await login_user_ws(websocket, data)
                if user:
                    username = user
                    connected_users[username] = websocket
                    await broadcast_user_list()

            elif action == "list_users":
                await broadcast_user_list()

            # NOTE: messaging actions intentionally not wired; for later use
            # elif action == "message":
            #     await chat_message(websocket, data)

            elif action == "ping":
                await websocket.send_text(json.dumps({"action": "pong"}))

            else:
                await websocket.send_text(json.dumps({"error": "Invalid action."}))

    except WebSocketDisconnect:
        pass

    finally:
        if username:
            set_user_status(username, 0)
            connected_users.pop(username, None)
            await broadcast_user_list()


if __name__ == "__main__":
    Initialize_db()
    uvicorn.run(app, host=HOST, port=PORT)
