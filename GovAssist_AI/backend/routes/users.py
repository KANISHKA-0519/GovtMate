from fastapi import APIRouter, HTTPException, Depends, Header
from models.schemas import UserCreate, UserUpdate, UserDB
from database.connection import get_db
from datetime import datetime
from typing import Optional
import logging

router = APIRouter(prefix="/api/users", tags=["users"])
logger = logging.getLogger(__name__)


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or authorization.strip() in ("", "Bearer", "Bearer undefined", "Bearer null"):
        return "user_demo_citizen_123"
    return authorization.replace("Bearer ", "").strip()


_mock_users_db: dict[str, dict] = {}


@router.post("/sync")
async def sync_user(data: UserCreate):
    db = get_db()
    user_dict = data.model_dump()
    user_dict["updatedAt"] = datetime.utcnow()

    if db is not None:
        existing = await db.users.find_one({"clerkId": data.clerkId})
        if existing:
            profile_completed = existing.get("profileCompleted", True)
            await db.users.update_one({"clerkId": data.clerkId}, {"$set": user_dict})
            user = {**existing, **user_dict, "profileCompleted": profile_completed}
        else:
            new_user = UserDB(**user_dict)
            user_dict_full = new_user.model_dump()
            user_dict_full["profileCompleted"] = True
            await db.users.insert_one(user_dict_full)
            user = user_dict_full
    else:
        existing = _mock_users_db.get(data.clerkId, {})
        profile_completed = existing.get("profileCompleted", True)
        user = {
            "id": data.clerkId,
            "clerkId": data.clerkId,
            "role": "citizen",
            **existing,
            **user_dict,
            "profileCompleted": profile_completed,
        }
        _mock_users_db[data.clerkId] = user

    return {"success": True, "data": _serialize(user)}


@router.get("/me")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    if db is not None:
        user = await db.users.find_one({"clerkId": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True, "data": _serialize(user)}

    user = _mock_users_db.get(user_id)
    if not user:
        user = {"id": user_id, "clerkId": user_id, "role": "citizen", "profileCompleted": True}
        _mock_users_db[user_id] = user
    return {"success": True, "data": _serialize(user)}


@router.put("/me")
async def update_profile(data: UserUpdate, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None and v != ""}
    if "fullName" in update_data:
        update_data["name"] = update_data["fullName"]
    update_data["updatedAt"] = datetime.utcnow()

    if db is not None:
        await db.users.update_one({"clerkId": user_id}, {"$set": update_data}, upsert=True)
        user = await db.users.find_one({"clerkId": user_id})
        return {"success": True, "data": _serialize(user)}

    existing = _mock_users_db.get(user_id, {"id": user_id, "clerkId": user_id, "role": "citizen"})
    existing.update(update_data)
    _mock_users_db[user_id] = existing
    return {"success": True, "data": _serialize(existing)}


def _serialize(doc: dict) -> dict:
    if doc is None:
        return {}
    doc.pop("_id", None)
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc
