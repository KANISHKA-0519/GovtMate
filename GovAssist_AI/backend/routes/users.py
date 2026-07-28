from fastapi import APIRouter, HTTPException, Depends, Header
from models.schemas import UserCreate, UserUpdate, UserDB
from database.connection import get_db
from datetime import datetime
from typing import Optional
import logging

router = APIRouter(prefix="/api/users", tags=["users"])
logger = logging.getLogger(__name__)


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    token = authorization.replace("Bearer ", "")
    return token  # In production, verify Clerk JWT


@router.post("/sync")
async def sync_user(data: UserCreate):
    db = get_db()
    user_dict = data.model_dump()
    user_dict["updatedAt"] = datetime.utcnow()

    if db is not None:
        existing = await db.users.find_one({"clerkId": data.clerkId})
        if existing:
            await db.users.update_one({"clerkId": data.clerkId}, {"$set": user_dict})
            user = {**existing, **user_dict}
        else:
            new_user = UserDB(**user_dict)
            user_dict_full = new_user.model_dump()
            await db.users.insert_one(user_dict_full)
            user = user_dict_full
    else:
        user = {**user_dict, "id": data.clerkId, "role": "citizen", "profileCompleted": False}

    return {"success": True, "data": _serialize(user)}


@router.get("/me")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    if db is not None:
        user = await db.users.find_one({"clerkId": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True, "data": _serialize(user)}
    return {"success": True, "data": {"id": user_id, "clerkId": user_id, "role": "citizen"}}


@router.put("/me")
async def update_profile(data: UserUpdate, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    # Sync fullName to name field as well
    if "fullName" in update_data:
        update_data["name"] = update_data["fullName"]
    update_data["updatedAt"] = datetime.utcnow()

    if db is not None:
        result = await db.users.update_one({"clerkId": user_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        user = await db.users.find_one({"clerkId": user_id})
        return {"success": True, "data": _serialize(user)}
    return {"success": True, "data": update_data}


def _serialize(doc: dict) -> dict:
    if doc is None:
        return {}
    doc.pop("_id", None)
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc
