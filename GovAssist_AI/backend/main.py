"""GovAssist AI - FastAPI Backend Application"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import socketio

from config.settings import get_settings
from database.connection import connect_db, disconnect_db
from routes import users, applications, documents, notifications, stats, agents, admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting GovAssist AI Backend...")
    await connect_db()
    logger.info("✅ GovAssist AI is ready!")
    yield
    await disconnect_db()
    logger.info("👋 GovAssist AI shutdown complete")


settings = get_settings()

app = FastAPI(
    title="GovAssist AI API",
    description="Autonomous Multi-Agent Government Certificate & Welfare Assistant",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[settings.frontend_url, "http://localhost:3000"],
    logger=False,
    engineio_logger=False,
)
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

_user_rooms: dict[str, str] = {}  # userId -> sid


@sio.event
async def connect(sid, environ):
    logger.info(f"Socket connected: {sid}")


@sio.event
async def join(sid, data):
    user_id = data.get("userId", "")
    if user_id:
        await sio.enter_room(sid, f"user_{user_id}")
        _user_rooms[user_id] = sid
        logger.info(f"User {user_id} joined room")


@sio.event
async def disconnect(sid):
    logger.info(f"Socket disconnected: {sid}")


async def emit_notification(user_id: str, notification: dict):
    """Emit notification to a specific user."""
    try:
        await sio.emit("notification", notification, room=f"user_{user_id}")
    except Exception as e:
        logger.warning(f"Socket emit failed: {e}")


async def emit_application_update(user_id: str, app_id: str, status: str):
    """Emit application status update to a specific user."""
    try:
        await sio.emit("application_update", {"id": app_id, "status": status}, room=f"user_{user_id}")
    except Exception as e:
        logger.warning(f"Socket emit failed: {e}")


# Include routers
app.include_router(users.router)
app.include_router(applications.router)
app.include_router(documents.router)
app.include_router(notifications.router)
app.include_router(stats.router)
app.include_router(agents.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "name": "GovAssist AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "agents": [
            "Citizen Support Agent",
            "Smart Form Filling Agent",
            "Document Verification Agent",
            "Eligibility Agent",
            "Scheme Recommendation Agent",
            "Workflow Agent",
            "Notification Agent",
            "Transparency Agent",
        ],
    }


@app.get("/health")
async def health():
    from database.connection import get_db
    db = get_db()
    return {
        "status": "healthy",
        "database": "connected" if db is not None else "disconnected (mock mode)",
        "environment": settings.environment,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(status_code=500, content={"success": False, "error": "Internal server error"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
