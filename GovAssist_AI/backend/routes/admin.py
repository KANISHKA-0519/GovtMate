from fastapi import APIRouter, HTTPException, Depends, Header, Body
from database.connection import get_db
from datetime import datetime, timedelta
from typing import Optional
import logging

router = APIRouter(prefix="/api/admin", tags=["admin"])
logger = logging.getLogger(__name__)


def _get_mock_admin_credentials() -> dict:
    from config.settings import get_settings
    settings = get_settings()
    if settings.default_admin_email and settings.default_admin_password:
        return {settings.default_admin_email: settings.default_admin_password}
    return {}


def _serialize(doc: dict) -> dict:
    if not doc:
        return {}
    doc.pop("_id", None)
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
        elif isinstance(v, list):
            doc[k] = [_serialize(i) if isinstance(i, dict) else i for i in v]
        elif isinstance(v, dict):
            doc[k] = _serialize(v)
    return doc


async def get_admin_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.replace("Bearer ", "")
    if not token.startswith("admin_"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return token


@router.post("/login")
async def admin_login(data: dict = Body(...)):
    email = data.get("email", "")
    password = data.get("password", "")
    db = get_db()

    if db is not None:
        admin = await db.admins.find_one({"email": email})
        if admin and admin.get("password") == password:
            token = f"admin_{admin['id']}"
            last_login_update = {"lastLogin": datetime.utcnow(), "updatedAt": datetime.utcnow()}
            await db.admins.update_one({"id": admin["id"]}, {"$set": last_login_update})
            admin.update(last_login_update)
            return {"success": True, "data": {"token": token, "admin": _serialize(admin)}}
    else:
        admin_credentials = _get_mock_admin_credentials()
        from config.settings import get_settings
        settings = get_settings()
        if email in admin_credentials and admin_credentials[email] == password:
            token = f"admin_mock_{email}"
            return {"success": True, "data": {
                "token": token,
                "admin": {
                    "id": "admin_1",
                    "name": settings.default_admin_name,
                    "email": email,
                    "role": "admin",
                    "department": "System Administration",
                    "phone": "+91-9999999999",
                    "lastLogin": datetime.utcnow().isoformat(),
                    "permissions": {
                        "viewCitizens": True,
                        "viewApplications": True,
                        "reviewApplications": True,
                        "approveApplications": True,
                        "rejectApplications": True,
                        "viewAnalytics": True,
                        "viewNotifications": True,
                    },
                }
            }}

    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/me")
async def get_admin_profile(admin_id: str = Depends(get_admin_user)):
    db = get_db()
    if db is not None:
        raw_id = admin_id.replace("admin_", "")
        admin = await db.admins.find_one({"id": raw_id})
        if admin:
            return {"success": True, "data": _serialize(admin)}
    from config.settings import get_settings
    settings = get_settings()
    return {"success": True, "data": {
        "id": admin_id, "name": settings.default_admin_name, "email": settings.default_admin_email,
        "role": "admin", "department": "System Administration", "phone": "+91-9999999999",
        "lastLogin": datetime.utcnow().isoformat(),
        "permissions": {
            "viewCitizens": True,
            "viewApplications": True,
            "reviewApplications": True,
            "approveApplications": True,
            "rejectApplications": True,
            "viewAnalytics": True,
            "viewNotifications": True,
        },
    }}


@router.get("/citizens")
async def get_all_citizens(
    page: int = 1, limit: int = 20, search: str = "",
    admin_id: str = Depends(get_admin_user)
):
    db = get_db()
    if db is not None:
        query = {"role": "citizen"}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]
        total = await db.users.count_documents(query)
        skip = (page - 1) * limit
        cursor = db.users.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        users = await cursor.to_list(length=limit)

        result = []
        for u in users:
            u = _serialize(u)
            app_count = await db.applications.count_documents({"userId": u.get("clerkId", u.get("id", ""))})
            u["totalApplications"] = app_count
            result.append(u)

        return {"success": True, "data": result, "total": total, "page": page, "limit": limit}
    return {"success": True, "data": [], "total": 0, "page": 1, "limit": limit}


@router.get("/citizens/{citizen_id}")
async def get_citizen_profile(citizen_id: str, admin_id: str = Depends(get_admin_user)):
    db = get_db()
    if db is not None:
        user = await db.users.find_one({"$or": [{"id": citizen_id}, {"clerkId": citizen_id}]})
        if not user:
            raise HTTPException(status_code=404, detail="Citizen not found")
        user = _serialize(user)
        uid = user.get("clerkId", user.get("id", ""))
        apps = await db.applications.find({"userId": uid}).sort("createdAt", -1).to_list(length=50)
        user["applications"] = [_serialize(a) for a in apps]
        return {"success": True, "data": user}
    raise HTTPException(status_code=404, detail="Citizen not found")


@router.get("/applications")
async def get_all_applications(
    page: int = 1, limit: int = 20, status: str = "", search: str = "",
    admin_id: str = Depends(get_admin_user)
):
    db = get_db()
    if db is not None:
        query = {}
        if status and status != "all":
            query["status"] = status
        if search:
            query["$or"] = [
                {"serviceName": {"$regex": search, "$options": "i"}},
                {"id": {"$regex": search, "$options": "i"}},
            ]
        total = await db.applications.count_documents(query)
        skip = (page - 1) * limit
        cursor = db.applications.find(query).skip(skip).limit(limit).sort("createdAt", -1)
        apps = await cursor.to_list(length=limit)

        result = []
        for app in apps:
            app = _serialize(app)
            user = await db.users.find_one({"clerkId": app.get("userId", "")})
            app["citizenName"] = user.get("name", "Unknown") if user else "Unknown"
            app["citizenEmail"] = user.get("email", "") if user else ""
            result.append(app)

        return {"success": True, "data": result, "total": total}
    return {"success": True, "data": [], "total": 0}


@router.get("/applications/{app_id}")
async def get_application_detail(app_id: str, admin_id: str = Depends(get_admin_user)):
    db = get_db()
    if db is not None:
        app = await db.applications.find_one({"id": app_id})
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        app = _serialize(app)
        citizen = await db.users.find_one({"clerkId": app.get("userId", "")})
        docs = await db.documents.find({"applicationId": app_id}).to_list(length=50)
        docs_list = [_serialize(d) for d in docs]

        app["citizen"] = _serialize(citizen) if citizen else None
        app["documents"] = docs_list

        return {"success": True, "data": app}
    raise HTTPException(status_code=404, detail="Application not found")


@router.put("/applications/{app_id}/status")
async def update_application_status(
    app_id: str, data: dict = Body(...), admin_id: str = Depends(get_admin_user)
):
    db = get_db()
    new_status = data.get("status")
    note = data.get("note", "")
    officer = data.get("officer", "")

    if not new_status:
        raise HTTPException(status_code=400, detail="Status required")

    if db is not None:
        app = await db.applications.find_one({"id": app_id})
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        timeline_event = {
            "id": str(__import__("uuid").uuid4()),
            "stage": f"Status Updated to {new_status.replace('_', ' ').title()}",
            "description": note or f"Application status changed to {new_status} by admin.",
            "status": "completed",
            "timestamp": datetime.utcnow(),
            "agent": "Admin",
        }

        update = {
            "status": new_status,
            "updatedAt": datetime.utcnow(),
            "$push": {"timeline": timeline_event},
        }
        if officer:
            update["assignedOfficer"] = officer

        await db.applications.update_one({"id": app_id}, {"$set": {
            "status": new_status, "updatedAt": datetime.utcnow(),
            **({"assignedOfficer": officer} if officer else {})
        }, "$push": {"timeline": timeline_event}})

        # Create notification for citizen
        from models.schemas import NotificationDB
        notif = NotificationDB(
            userId=app["userId"],
            title=f"Application {new_status.replace('_', ' ').title()}",
            message=note or f"Your {app.get('serviceName', 'application')} has been {new_status}.",
            type="success" if new_status == "approved" else ("error" if new_status == "rejected" else "info"),
            applicationId=app_id,
        )
        await db.notifications.insert_one(notif.model_dump())

        updated = await db.applications.find_one({"id": app_id})
        return {"success": True, "data": _serialize(updated)}
    return {"success": True, "data": {"id": app_id, "status": new_status}}


@router.get("/analytics")
async def get_admin_analytics(admin_id: str = Depends(get_admin_user)):
    db = get_db()
    if db is not None:
        total = await db.applications.count_documents({})
        approved = await db.applications.count_documents({"status": "approved"})
        rejected = await db.applications.count_documents({"status": "rejected"})
        pending = await db.applications.count_documents({"status": {"$in": ["submitted", "under_review", "document_verification", "eligibility_verification", "scheme_recommendation", "waiting_admin_review", "admin_review"]}})
        under_review = await db.applications.count_documents({"status": "under_review"})
        waiting_admin = await db.applications.count_documents({"status": "waiting_admin_review"})
        docs_required = await db.applications.count_documents({"status": {"$in": ["documents_required", "additional_documents_required"]}})
        total_citizens = await db.users.count_documents({"role": "citizen"})

        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_apps = await db.applications.count_documents({"createdAt": {"$gte": today}})

        # Applications by service
        pipeline_service = [
            {"$group": {"_id": "$serviceName", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}, {"$limit": 10}
        ]
        by_service = await db.applications.aggregate(pipeline_service).to_list(length=10)

        # Applications by district
        pipeline_district = [
            {"$lookup": {"from": "users", "localField": "userId", "foreignField": "clerkId", "as": "user"}},
            {"$unwind": {"path": "$user", "preserveNullAndEmpty": True}},
            {"$group": {"_id": "$user.district", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}, {"$limit": 10}
        ]
        by_district = await db.applications.aggregate(pipeline_district).to_list(length=10)

        # Monthly applications (last 6 months)
        monthly = []
        for i in range(5, -1, -1):
            start = (datetime.utcnow().replace(day=1) - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0)
            end = (start + timedelta(days=32)).replace(day=1)
            count = await db.applications.count_documents({"createdAt": {"$gte": start, "$lt": end}})
            app_approved = await db.applications.count_documents({"createdAt": {"$gte": start, "$lt": end}, "status": "approved"})
            monthly.append({"month": start.strftime("%b"), "applications": count, "approved": app_approved})

        # Department performance
        pipeline_dept = [
            {"$group": {"_id": "$department", "total": {"$sum": 1},
                "approved": {"$sum": {"$cond": [{"$eq": ["$status", "approved"]}, 1, 0]}},
                "pending": {"$sum": {"$cond": [{"$in": ["$status", ["submitted", "under_review", "document_verification", "eligibility_verification", "scheme_recommendation", "waiting_admin_review", "admin_review"]]}, 1, 0]}},
                "rejected": {"$sum": {"$cond": [{"$eq": ["$status", "rejected"]}, 1, 0]}}}},
            {"$sort": {"total": -1}}, {"$limit": 8}
        ]
        dept_perf = await db.applications.aggregate(pipeline_dept).to_list(length=8)

        approval_rate = round((approved / total * 100), 1) if total > 0 else 0
        rejection_rate = round((rejected / total * 100), 1) if total > 0 else 0

        return {"success": True, "data": {
            "total": total, "approved": approved, "rejected": rejected,
            "pending": pending, "under_review": under_review,
            "waiting_admin_review": waiting_admin,
            "additional_documents_required": docs_required,
            "total_citizens": total_citizens, "today_apps": today_apps,
            "approval_rate": approval_rate, "rejection_rate": rejection_rate,
            "by_service": [{"name": x["_id"] or "Unknown", "value": x["count"]} for x in by_service],
            "by_district": [{"name": x["_id"] or "Unknown", "value": x["count"]} for x in by_district],
            "monthly": monthly,
            "dept_performance": [{"name": x["_id"] or "Unknown", "total": x["total"],
                "approved": x["approved"], "pending": x["pending"], "rejected": x["rejected"]} for x in dept_perf],
        }}

    return {"success": True, "data": {
        "total": 0, "approved": 0, "rejected": 0, "pending": 0, "under_review": 0,
        "waiting_admin_review": 0, "additional_documents_required": 0,
        "total_citizens": 0, "today_apps": 0, "approval_rate": 0, "rejection_rate": 0,
        "by_service": [], "by_district": [], "monthly": [], "dept_performance": [],
    }}


@router.get("/notifications")
async def get_admin_notifications(admin_id: str = Depends(get_admin_user)):
    db = get_db()
    if db is not None:
        # Recent registrations
        recent_users = await db.users.find({"role": "citizen"}).sort("createdAt", -1).limit(5).to_list(5)
        recent_apps = await db.applications.find({}).sort("createdAt", -1).limit(5).to_list(5)
        pending_count = await db.applications.count_documents({"status": {"$in": ["submitted", "under_review", "document_verification", "eligibility_verification", "waiting_admin_review", "admin_review"]}})
        waiting_admin_count = await db.applications.count_documents({"status": "waiting_admin_review"})
        rejected_count = await db.applications.count_documents({"status": "rejected"})

        notifications = []
        for u in recent_users:
            notifications.append({
                "id": str(u.get("id", "")), "type": "registration",
                "title": "New Citizen Registered",
                "message": f"{u.get('name', 'Unknown')} joined the platform",
                "time": u.get("createdAt", datetime.utcnow()).isoformat() if isinstance(u.get("createdAt"), datetime) else str(u.get("createdAt", "")),
            })
        for a in recent_apps:
            notifications.append({
                "id": str(a.get("id", "")), "type": "application",
                "title": "New Application Submitted",
                "message": f"{a.get('serviceName', 'Unknown')} application received",
                "time": a.get("createdAt", datetime.utcnow()).isoformat() if isinstance(a.get("createdAt"), datetime) else str(a.get("createdAt", "")),
            })
        if waiting_admin_count > 0:
            notifications.append({
                "id": "waiting_admin_alert", "type": "alert",
                "title": "Applications Awaiting Review",
                "message": f"{waiting_admin_count} applications waiting for admin review",
                "time": datetime.utcnow().isoformat(),
            })
        if pending_count > 0:
            notifications.append({
                "id": "pending_alert", "type": "alert",
                "title": "Pending Reviews",
                "message": f"{pending_count} applications awaiting review",
                "time": datetime.utcnow().isoformat(),
            })

        return {"success": True, "data": notifications}
    return {"success": True, "data": []}
