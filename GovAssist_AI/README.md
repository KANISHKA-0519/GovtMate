# GovAssist AI 🏛️

**Autonomous Multi-Agent Government Certificate & Welfare Assistant**

An AI-powered e-Governance platform that simplifies government service applications using 8 autonomous LangGraph agents.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| UI | shadcn/ui, Framer Motion, Recharts, Lucide React |
| State | Zustand, TanStack Query |
| Backend | FastAPI, Python 3.12+ |
| Database | MongoDB Atlas |
| Auth | Clerk Authentication |
| AI Model | Groq API (Llama 3.3 70B) |
| AI Agents | LangGraph |
| OCR | Google Vision API / Tesseract |
| Storage | Cloudinary |
| Deploy | Vercel (Frontend) + Render (Backend) |

---

## 🤖 8 AI Agents

1. **Citizen Support Agent** — Understands requests, guides citizens
2. **Smart Form Filling Agent** — Auto-fills forms from OCR data
3. **Document Verification Agent** — OCR, extraction, validation
4. **Eligibility Agent** — Checks income, age, category rules
5. **Scheme Recommendation Agent** — Recommends welfare schemes
6. **Workflow Agent** — Routes to departments, manages status
7. **Notification Agent** — Sends real-time notifications
8. **Transparency Agent** — Builds audit trail and progress tracking

---

## 📁 Project Structure

```
Agentverse/
├── frontend/                    # Next.js 15 App
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── dashboard/       # Citizen dashboard
│   │   │   ├── upload/          # Document upload
│   │   │   ├── applications/    # Application tracking
│   │   │   ├── transparency/    # Real-time tracking
│   │   │   ├── notifications/   # Notification center
│   │   │   ├── analytics/       # Analytics dashboard
│   │   │   ├── admin/           # Admin panel
│   │   │   ├── profile/         # User profile
│   │   │   ├── settings/        # App settings
│   │   │   ├── sign-in/         # Clerk sign-in
│   │   │   └── sign-up/         # Clerk sign-up
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI components
│   │   │   ├── layout/          # Layout components
│   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   └── agents/          # AI agent components
│   │   ├── services/            # API service layer
│   │   ├── store/               # Zustand state
│   │   ├── types/               # TypeScript types
│   │   └── lib/                 # Utilities
│   └── package.json
│
└── backend/                     # FastAPI Backend
    ├── main.py                  # App entry point
    ├── agents/
    │   ├── orchestrator.py      # LangGraph workflow
    │   ├── citizen_support.py   # Agent 1
    │   ├── form_filling.py      # Agent 2
    │   ├── document_verification.py  # Agent 3
    │   ├── eligibility.py       # Agent 4
    │   ├── scheme_recommendation.py  # Agent 5
    │   ├── workflow.py          # Agent 6
    │   ├── notification.py      # Agent 7
    │   └── transparency.py      # Agent 8
    ├── routes/                  # API endpoints
    ├── models/                  # Pydantic schemas
    ├── database/                # MongoDB connection
    ├── services/                # OCR, Storage services
    └── config/                  # Settings
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.12+
- MongoDB Atlas account
- Clerk account
- Groq API key
- Cloudinary account (optional)

### 1. Clone & Setup

```bash
git clone <repo-url>
cd Agentverse
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run dev
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
python main.py
```

### 4. Environment Variables

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`backend/.env`):
```env
MONGODB_URL=mongodb+srv://...
GROQ_API_KEY=gsk_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLERK_SECRET_KEY=sk_test_...
SECRET_KEY=your-secret-key
```

---

## 🌐 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/sync` | Sync Clerk user |
| GET | `/api/users/me` | Get user profile |
| POST | `/api/applications` | Create application |
| GET | `/api/applications` | List applications |
| POST | `/api/applications/{id}/workflow` | Run AI workflow |
| POST | `/api/documents/upload` | Upload document |
| POST | `/api/documents/{id}/verify` | Verify document |
| GET | `/api/notifications` | Get notifications |
| POST | `/api/agents/chat` | Chat with AI |
| GET | `/api/stats/dashboard` | Dashboard stats |
| GET | `/health` | Health check |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Render
1. Connect GitHub repo to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

---

## 🎨 Design System

- **Primary**: `#8EC5FC` (Soft Blue)
- **Secondary**: `#E0C3FC` (Soft Purple)
- **Accent**: `#B5EAD7` (Mint Green)
- **Background**: `#F8FAFC`
- **Dark Mode**: Muted navy palette

---

## 📝 Notes

- The app works in **mock mode** without MongoDB/Groq configured
- All 8 agents execute sequentially via LangGraph
- OCR falls back to Tesseract if Google Vision is unavailable
- File storage falls back to mock URLs if Cloudinary is not configured

---

Built for National Hackathon 2025 🏆
