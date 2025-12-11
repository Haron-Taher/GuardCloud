# GuardCloud

<p align="center">
  <img src="frontend/app/assets/logos/securecloud.png" alt="GuardCloud Logo" width="120">
</p>

<p align="center">
  <strong>A secure, self-hostable cloud storage platform with end-to-end encryption</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#installation">Installation</a> •
  <a href="#running-the-application">Running</a> •
  <a href="#usage-guide">Usage</a> •
  <a href="#api-documentation">API</a>
</p>

---

## Overview

GuardCloud is a privacy-focused cloud storage solution that puts you in control of your data. Unlike traditional cloud storage providers, GuardCloud uses **zero-knowledge encryption** — your files are encrypted on your device before they ever leave it, meaning not even the server can read your data.

Perfect for individuals and organizations who want the convenience of cloud storage without sacrificing privacy.

---

## Features

### 🔐 Security & Encryption
- **End-to-End Encryption**: Files are encrypted client-side using AES-256-GCM before upload
- **Zero-Knowledge Architecture**: The server never sees your unencrypted data or encryption keys
- **Password-Derived Keys**: Your master encryption key is derived from your password using PBKDF2 with 100,000 iterations
- **Per-File Encryption Keys**: Each file gets its own unique encryption key, wrapped with your master key
- **Encrypted Database**: User data stored in SQLCipher-encrypted SQLite database
- **Secure Authentication**: JWT tokens with bcrypt password hashing

### 📁 File Management
- **Upload Files**: Drag-and-drop or click to upload (up to 100MB per file)
- **Download Files**: Automatic decryption on download
- **File Preview**: View images, PDFs, and text files directly in the browser
- **Organize with Folders**: Create folders and move files between them
- **Search**: Find files quickly with the search function
- **Trash & Recovery**: Deleted files go to trash for 30 days before permanent deletion
- **Star Files**: Mark important files for quick access

### 🔗 Secure Sharing
- **Share Links**: Generate secure links to share files with anyone
- **Password Protection**: Optionally require a password to access shared files
- **Expiration Dates**: Set links to expire after a certain number of days
- **Download Limits**: Limit how many times a file can be downloaded
- **Revoke Access**: Delete share links anytime to revoke access

### 🎨 User Experience
- **Modern UI**: Clean, responsive interface built with Vue 3 and Tailwind CSS
- **Dark/Light Mode**: Toggle between themes based on your preference
- **Real-time Progress**: See encryption and upload progress in real-time
- **Keyboard Shortcuts**: Press `/` to focus search, `Escape` to close dialogs
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

### 📊 Account Management
- **Storage Tracking**: See how much storage you've used
- **Activity Log**: View your recent actions (uploads, downloads, shares)
- **Profile Settings**: Update email and change password
- **Session Management**: Secure logout clears all encryption keys

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Nuxt 4** | Vue.js framework for the web application |
| **Vue 3** | Reactive UI components |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first styling |
| **Web Crypto API** | Client-side AES-256-GCM encryption |

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.10+** | Backend runtime |
| **FastAPI** | REST API framework |
| **SQLCipher** | Encrypted SQLite database |
| **JWT (PyJWT)** | Token-based authentication |
| **bcrypt** | Password hashing |
| **Uvicorn** | ASGI web server |

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)

To verify your installations:
```bash
node --version    # Should show v18.x.x or higher
python --version  # Should show Python 3.10.x or higher
git --version     # Should show git version x.x.x
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/GuardCloud.git
cd GuardCloud
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv .venv

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Backend Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
# Database configuration
DB_FILE=guardcloud.db

# SQLCipher encryption key (generate a secure random key)
# You can generate one with: python -c "import secrets; print(secrets.token_hex(32))"
SQLCIPHER_KEY=your_secure_random_key_here

# JWT configuration
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your_jwt_secret_key_here
ALGORITHM=HS256
TOKEN_EXPIRY_MINUTES=60

# Server configuration
HOST=0.0.0.0
PORT=8000

# File storage location
STORAGE_ROOT=storage

# Storage limit per user (default: 15GB)
STORAGE_LIMIT=16106127360
```

**⚠️ Important**: Generate unique keys for `SQLCIPHER_KEY` and `SECRET_KEY`. Never use the example values in production!

Generate secure keys:
```bash
python -c "import secrets; print('SQLCIPHER_KEY=' + secrets.token_hex(32))"
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 5. Frontend Configuration (Optional)

The frontend connects to the backend at `http://127.0.0.1:8000` by default. To change this, edit `frontend/nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiBase: 'http://127.0.0.1:8000',  // Change to your backend URL
  }
}
```

---

## Running the Application

You need to run both the backend and frontend servers.

### Start the Backend Server

```bash
# From the backend directory (with virtual environment activated)
cd backend
python server.py
```

The backend will start at `http://127.0.0.1:8000`

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### Start the Frontend Server

Open a **new terminal** and run:

```bash
# From the frontend directory
cd frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

You should see:
```
Nuxt 4.x.x with Nitro x.x.x
Local:    http://localhost:3000/
```

### Access the Application

Open your browser and go to: **http://localhost:3000**

---

## Usage Guide

### Creating an Account

1. Click **"Get Started"** on the landing page
2. Enter a **username** (at least 3 characters)
3. Enter an **email** (optional, but recommended for account recovery)
4. Create a **strong password** with:
   - At least 12 characters
   - Uppercase and lowercase letters
   - At least one number
   - At least one special character ($@!&_-)
5. Click **"Create account"**

**⚠️ Important**: Your password is used to derive your encryption key. If you forget your password, your files cannot be recovered!

### Logging In

1. Click **"Sign in"**
2. Enter your username and password
3. Click **"Sign in"**

After logging in, your encryption key is derived from your password and stored securely in your browser's memory.

### Uploading Files

**Method 1: Click to Upload**
1. Click the **"+ New"** button in the sidebar or top bar
2. Select **"Upload files"**
3. Choose files from your computer

**Method 2: Drag and Drop**
1. Drag files from your computer
2. Drop them anywhere in the dashboard area

**What happens during upload:**
1. File is read into memory
2. A random encryption key is generated for this file
3. File is encrypted with AES-256-GCM
4. The file key is wrapped with your master key
5. Encrypted file + wrapped key are uploaded to the server

### Organizing Files

**Create a Folder:**
1. Click **"+ New"** → **"New folder"**
2. Enter folder name
3. Click **"Create"**

**Move Files:**
1. Right-click a file
2. Select **"Move to..."**
3. Choose destination folder

**Rename Files/Folders:**
1. Right-click the item
2. Select **"Rename"**
3. Enter new name

### Downloading Files

1. Right-click a file
2. Select **"Download"**

Or double-click to preview, then click the download button.

**What happens during download:**
1. Encrypted file is downloaded from server
2. Wrapped key is unwrapped using your master key
3. File is decrypted using the file key
4. Decrypted file is saved to your computer

### Previewing Files

Double-click any file to preview it. Supported formats:
- **Images**: PNG, JPG, GIF, WebP, SVG
- **Documents**: PDF
- **Text**: TXT, MD, JSON, JS, HTML, CSS, and more

### Sharing Files

1. Right-click a file
2. Select **"Share"**
3. Configure share options:
   - **Password protect**: Require a password to download
   - **Set expiration**: Link expires after X days
   - **Limit downloads**: Maximum number of downloads allowed
4. Click **"Create link"**
5. Copy the link and share it

**How secure sharing works:**
- When you create a share link, the file is decrypted on your device
- A separate, unencrypted copy is uploaded for the share
- Recipients can download without needing your encryption key
- Delete the share link to revoke access

### Managing Share Links

1. Right-click a shared file
2. Select **"Share"**
3. View existing links with:
   - Download count
   - Expiration status
   - Password protection status
4. Click the trash icon to delete a link

### Deleting Files

**Move to Trash:**
1. Right-click a file
2. Select **"Move to trash"**

**Restore from Trash:**
1. Click **"Trash"** in the sidebar
2. Right-click the file
3. Select **"Restore"**

**Permanent Delete:**
1. Go to Trash
2. Right-click the file
3. Select **"Delete permanently"**

Files in trash are automatically deleted after 30 days.

### Using Search

1. Click the search bar or press `/`
2. Type your search query
3. Results appear instantly
4. Click a result to navigate to it

### Changing Settings

1. Click your avatar in the top-right
2. Select **"Settings"**

**Available settings:**
- Update email address
- Change password
- View storage usage
- Toggle dark/light mode

### Logging Out

1. Click your avatar in the top-right
2. Select **"Sign out"**

Logging out:
- Clears your authentication token
- Clears your encryption key from memory
- Redirects to the login page

---

## Project Structure

```
GuardCloud/
├── backend/
│   ├── .env                 # Environment variables
│   ├── server.py            # FastAPI application & routes
│   ├── database.py          # SQLCipher database operations
│   ├── security.py          # Authentication & password hashing
│   ├── requirements.txt     # Python dependencies
│   └── storage/             # Uploaded files storage
│
├── frontend/
│   ├── app/
│   │   ├── pages/           # Route pages
│   │   │   ├── index.vue    # Landing page
│   │   │   ├── login.vue    # Login page
│   │   │   ├── signup.vue   # Registration page
│   │   │   ├── dashboard.vue # Main file manager
│   │   │   ├── settings.vue # User settings
│   │   │   └── share/[token].vue # Public share download
│   │   │
│   │   ├── components/      # Reusable UI components
│   │   │   └── dashboard/   # Dashboard-specific components
│   │   │
│   │   ├── composables/     # Vue composables (shared logic)
│   │   │   ├── useAuth.ts   # Authentication state & actions
│   │   │   ├── useFiles.ts  # File operations
│   │   │   └── useTheme.ts  # Theme management
│   │   │
│   │   ├── utils/           # Utility functions
│   │   │   ├── crypto.ts    # Encryption/decryption
│   │   │   └── apiClient.ts # Axios HTTP client
│   │   │
│   │   ├── middleware/      # Route middleware
│   │   │   └── auth.global.ts # Authentication guard
│   │   │
│   │   └── assets/          # Static assets (CSS, images)
│   │
│   ├── nuxt.config.ts       # Nuxt configuration
│   └── package.json         # Node.js dependencies
│
├── FR_LOCATIONS.md          # Functional requirements mapping
└── README.md                # This file
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create a new user account |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/profile` | Update user email |
| PUT | `/auth/password` | Change password |

### File Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/files` | List files and folders |
| GET | `/files/search?q=` | Search files by name |
| GET | `/files/trash` | List trashed files |
| POST | `/files/upload` | Upload a file |
| GET | `/files/{id}` | Get file info |
| GET | `/files/{id}/download` | Download a file |
| PUT | `/files/{id}/rename` | Rename a file |
| PUT | `/files/{id}/move` | Move file to folder |
| POST | `/files/{id}/trash` | Move to trash |
| POST | `/files/{id}/restore` | Restore from trash |
| DELETE | `/files/{id}` | Permanently delete |

### Folder Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/folders` | Create a folder |
| GET | `/folders/{id}` | Get folder info |
| PUT | `/folders/{id}/rename` | Rename folder |
| DELETE | `/folders/{id}` | Delete folder |

### Share Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/files/{id}/share` | Create share link |
| GET | `/files/{id}/shares` | List file's share links |
| DELETE | `/shares/{id}` | Delete share link |
| GET | `/share/{token}` | Get shared file info (public) |
| POST | `/share/{token}/download` | Download shared file (public) |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/storage` | Get storage usage stats |
| GET | `/activity` | Get activity log |
| GET | `/health` | Health check |

---

## Security Features

### Encryption Details

| Component | Algorithm | Details |
|-----------|-----------|---------|
| File Encryption | AES-256-GCM | 256-bit key, 96-bit IV |
| Key Derivation | PBKDF2-SHA256 | 100,000 iterations |
| Key Wrapping | AES-256-GCM | Master key wraps file keys |
| Password Hashing | bcrypt | Salted, adaptive cost |
| Database | SQLCipher | AES-256 encrypted SQLite |
| Tokens | JWT HS256 | 60-minute expiration |

### Zero-Knowledge Architecture

1. Your password never leaves your browser
2. Encryption keys are derived client-side
3. Files are encrypted before upload
4. The server only stores encrypted blobs
5. Decryption happens in your browser

---

## Troubleshooting

### "Encryption not initialized"
- Log out and log back in
- Clear browser cache and try again
- Make sure cookies/localStorage are enabled

### Upload fails
- Check file size (max 100MB)
- Check storage quota
- Verify backend is running

### Can't preview files
- File may be corrupted
- Try downloading instead
- Check browser console for errors

### Share link not working
- Link may have expired
- Download limit may be reached
- Password may be required

### Backend won't start
- Check Python version (3.10+)
- Verify all dependencies installed
- Check .env file exists with valid keys

### Frontend won't start
- Check Node.js version (18+)
- Run `npm install` again
- Delete `node_modules` and reinstall

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_FILE` | SQLite database filename | `guardcloud.db` |
| `SQLCIPHER_KEY` | Database encryption key | (required) |
| `SECRET_KEY` | JWT signing key | (required) |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `TOKEN_EXPIRY_MINUTES` | Token lifetime | `60` |
| `HOST` | Server bind address | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `STORAGE_ROOT` | File storage directory | `storage` |
| `STORAGE_LIMIT` | Per-user storage limit (bytes) | `16106127360` (15GB) |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Nuxt.js](https://nuxt.com/) - The Vue.js framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [SQLCipher](https://www.zetetic.net/sqlcipher/) - Encrypted SQLite
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

<p align="center">
  Made with ❤️ for privacy
</p>
