from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config.settings import get_settings
import logging
from models.schemas import AdminDB, AdminPermissions

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    global _client, _db
    settings = get_settings()
    try:
        _client = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
        await _client.admin.command("ping")
        _db = _client[settings.mongodb_db_name]
        await _create_indexes()
        await _seed_default_admin()
        logger.info("✅ MongoDB connected successfully")
    except Exception as e:
        logger.warning(f"⚠️  MongoDB connection failed: {e}. Running with mock data.")
        _client = None
        _db = None


async def disconnect_db() -> None:
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB disconnected")


def get_db() -> AsyncIOMotorDatabase | None:
    return _db


async def _create_indexes() -> None:
    if _db is None:
        return
    await _db.users.create_index("clerkId", unique=True)
    await _db.users.create_index("email")
    await _db.applications.create_index("userId")
    await _db.applications.create_index("status")
    await _db.documents.create_index("userId")
    await _db.documents.create_index("applicationId")
    await _db.notifications.create_index([("userId", 1), ("read", 1)])
    await _db.admins.create_index("email", unique=True)
    await _db.logs.create_index([("applicationId", 1), ("createdAt", -1)])


async def _seed_default_admin() -> None:
    if _db is None:
        return
    from config.settings import get_settings
    settings = get_settings()
    default_email = settings.default_admin_email
    default_password = settings.default_admin_password
    if not default_password:
        logger.warning("⚠️  DEFAULT_ADMIN_PASSWORD not set in .env — skipping default admin seed.")
        return
    existing = await _db.admins.find_one({"email": default_email})
    if existing:
        logger.info("ℹ️  Default admin account already exists, skipping seed")
        return
    default_admin = AdminDB(
        email=default_email,
        password=default_password,
        name=settings.default_admin_name,
        role="admin",
        department="System Administration",
        permissions=AdminPermissions(
            viewCitizens=True,
            viewApplications=True,
            reviewApplications=True,
            approveApplications=True,
            rejectApplications=True,
            viewAnalytics=True,
            viewNotifications=True,
        ),
        phone="+91-9999999999",
    )
    await _db.admins.insert_one(default_admin.model_dump())
    logger.info(f"✅ Default admin account seeded: {default_email}")
