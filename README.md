# ⚡ RTC Code Review Platform

A full-stack real-time collaborative code review platform inspired by VS Code, GitHub, and Replit.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TailwindCSS + Redux Toolkit |
| **Backend** | Node.js + Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **Real-time** | Socket.IO |
| **Editor** | Monaco Editor (`@monaco-editor/react`) |
| **UI** | Dark VS Code–inspired, glassmorphism, Violet accent |

---

## 📁 Project Structure

```
rtc-platform/
├── backend/
│   ├── models/          # Mongoose schemas (User, Session, Review, PullRequest)
│   ├── routes/          # Express routes (/auth, /sessions, /reviews, /pull-requests, /run)
│   ├── middleware/       # JWT auth middleware
│   ├── socket/          # Socket.IO handler (real-time collab)
│   ├── .env.example
│   └── server.js        # Express + Socket.IO entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── editor/   # EditorPanel.jsx (Monaco + Console + Tabs)
        │   └── layout/   # AppLayout, Sidebar, Navbar
        ├── pages/        # Login, Register, Dashboard, Editor, Sessions, Reviews, PRs, Profile, Settings
        ├── redux/
        │   └── slices/   # authSlice, sessionSlice, editorSlice, uiSlice
        ├── services/     # api.js (axios), socket.js (Socket.IO client)
        └── App.jsx       # Router + protected routes
```

---

## ⚙️ Setup & Installation

### 1. Clone or extract the project

```bash
cd rtc-platform
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev     # starts on port 5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev     # starts on port 5173
```

### 4. Environment variables (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/rtc_platform
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

> **MongoDB**: Use [MongoDB Atlas](https://cloud.mongodb.com) for a free cloud DB, or run MongoDB locally.

---

## ✨ Features

### 🔐 Authentication
- Register / Login with JWT
- Persistent auth via localStorage
- Protected routes via React Router

### 📊 Dashboard
- Collaboration stats (sessions, reviews, PRs)
- Recent sessions + pull requests feed
- Activity panel
- Quick session creation

### 💻 Real-Time Code Editor
- **Monaco Editor** (VS Code's editor engine)
- **Socket.IO** real-time code sync across all collaborators
- Live cursor presence (who's in the room)
- File tabs system (add multiple files)
- Language selector (9 languages)
- **Run button** → executes JS in a sandbox, returns console output
- **Console panel** (VS Code style, resizable, auto-scroll)
- Debounced auto-save to MongoDB
- Fira Code font with ligatures

### 👥 Sessions
- Create/delete collaboration sessions
- Join via session room ID
- Language + code persisted per session

### 🔍 Code Reviews
- Create reviews with code paste
- Approve / Reject actions
- Inline commenting system
- Filter by status

### 🔀 Pull Requests
- Open / Draft / Merge / Close workflow
- Diff code display
- Comment threads
- Reviewer assignment

### 👤 Profile
- Edit bio, avatar, GitHub link
- Skill tags
- Stats overview

### ⚙️ Settings
- Font size slider
- Word wrap toggle
- Minimap toggle
- Notification preferences
- Theme selector

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/sessions` | List user sessions |
| POST | `/api/sessions` | Create session |
| GET | `/api/sessions/:id` | Get session |
| PUT | `/api/sessions/:id` | Update session |
| DELETE | `/api/sessions/:id` | Delete session |
| GET | `/api/reviews` | List reviews |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review status |
| POST | `/api/reviews/:id/comments` | Add comment |
| GET | `/api/pull-requests` | List PRs |
| POST | `/api/pull-requests` | Create PR |
| PUT | `/api/pull-requests/:id` | Merge/close PR |
| POST | `/api/pull-requests/:id/comments` | Add PR comment |
| POST | `/api/run` | Execute code |

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join a collaboration room |
| `room-users` | Server → Client | Current users in room |
| `user-joined` | Server → Client | New user joined |
| `user-left` | Server → Client | User disconnected |
| `code-change` | Client → Server | User typed code |
| `code-update` | Server → Client | Broadcast code to others |
| `language-change` | Client → Server | Language switched |
| `language-update` | Server → Client | Broadcast language change |
| `save-code` | Client → Server | Persist code to DB |
| `code-saved` | Server → Client | Save confirmed |
| `code-sync` | Server → Client | Initial code on join |
| `send-message` | Client → Server | Chat message |
| `new-message` | Server → Client | Chat broadcast |

---

## 🎨 Design System

```
Background:   #0B1020 (primary), #111827 (secondary), #141c2e (card)
Accent:       #7C3AED (violet/purple)
Text:         #E2E8F0 (primary), #94A3B8 (secondary), #64748B (muted)
Borders:      #1e2d45
Success:      #10B981  Error: #EF4444  Warning: #F59E0B

Fonts:
  UI:     Inter
  Code:   Fira Code (with ligatures)
```

---

## 🔧 Code Execution

- **JavaScript**: Runs in a secure `vm2` sandbox with 5-second timeout
- **Other languages**: Simulated output (requires setting up a language server / Judge0 for full support)
- Console output is streamed back with type (`log`, `error`, `warn`, `info`) and timestamp

---

## 📦 Production Build

```bash
# Frontend
cd frontend && npm run build   # outputs to dist/

# Backend: serve frontend dist via express static or deploy separately
# Add to server.js:
# app.use(express.static('../frontend/dist'));
```

---

## 🛡️ Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT expiry: 7 days
- Code execution sandboxed with `vm2` + 5s timeout
- CORS restricted to `CLIENT_URL`
- Auth middleware on all protected routes

---

## 📝 License

MIT — free to use and modify.
