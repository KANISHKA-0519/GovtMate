from fastapi import APIRouter, Depends, Header, HTTPException
from models.schemas import NotificationDB
from database.connection import get_db
from datetime import datetime
from typing import Optional
import logging

router = APIRouter(prefix="/api/notifications", tags=["notifications"])
logger = logging.getLogger(__name__)

_mock_notifications_db: dict[str, list[dict]] = {}


async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or authorization.strip() in ("", "Bearer", "Bearer undefined", "Bearer null"):
        return "user_demo_citizen_123"
    return authorization.replace("Bearer ", "").strip()


def _serialize(doc: dict) -> dict:
    if not doc:
        return {}
    doc.pop("_id", None)
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


@router.get("")
async def get_notifications(user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        cursor = db.notifications.find({"userId": user_id}).sort("createdAt", -1).limit(50)
        notifs = await cursor.to_list(length=50)
        return {"success": True, "data": [_serialize(n) for n in notifs]}
    
    notifs = _mock_notifications_db.get(user_id, [])
    if not notifs:
        notif_default = {
            "id": "n1", "userId": user_id, "title": "Welcome to GovAssist AI",
            "message": "Your account has been set up. Start by uploading your documents.",
            "type": "info", "read": False, "createdAt": datetime.utcnow().isoformat()
        }
        _mock_notifications_db[user_id] = [notif_default]
        notifs = [notif_default]
    return {"success": True, "data": [_serialize(n) for n in notifs]}


@router.put("/{notif_id}/read")
async def mark_read(notif_id: str, user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        await db.notifications.update_one(
            {"id": notif_id, "userId": user_id},
            {"$set": {"read": True}}
        )
        notif = await db.notifications.find_one({"id": notif_id})
        return {"success": True, "data": _serialize(notif) if notif else {"id": notif_id, "read": True}}
    
    notifs = _mock_notifications_db.get(user_id, [])
    target = None
    for n in notifs:
        if str(n.get("id")) == str(notif_id):
            n["read"] = True
            target = n
            break
    return {"success": True, "data": _serialize(target) if target else {"id": notif_id, "read": True}}


@router.put("/read-all")
async def mark_all_read(user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        await db.notifications.update_many({"userId": user_id, "read": False}, {"$set": {"read": True}})
    else:
        notifs = _mock_notifications_db.get(user_id, [])
        for n in notifs:
            n["read"] = True
    return {"success": True, "data": None}
