from fastapi import APIRouter, Depends, Header, HTTPException
from database.connection import get_db
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/api/stats", tags=["stats"])


async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return authorization.replace("Bearer ", "")


@router.get("/dashboard")
async def get_dashboard_stats(user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        total = await db.applications.count_documents({"userId": user_id})
        pending = await db.applications.count_documents({"userId": user_id, "status": {"$in": ["submitted", "under_review"]}})
        approved = await db.applications.count_documents({"userId": user_id, "status": "approved"})
        rejected = await db.applications.count_documents({"userId": user_id, "status": "rejected"})
        docs = await db.documents.count_documents({"userId": user_id})
        apps = await db.applications.find({"userId": user_id}).to_list(length=100)
        schemes = sum(len(a.get("recommendations", [])) for a in apps)
        return {"success": True, "data": {
            "totalApplications": total, "pendingApplications": pending,
            "approvedApplications": approved, "rejectedApplications": rejected,
            "documentsUploaded": docs, "schemesRecommended": schemes,
        }}
    return {"success": True, "data": {
        "totalApplications": 0, "pendingApplications": 0,
        "approvedApplications": 0, "rejectedApplications": 0,
        "documentsUploaded": 0, "schemesRecommended": 0,
    }}


@router.get("/citizen-analytics")
async def get_citizen_analytics(user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        apps = await db.applications.find({"userId": user_id}).sort("createdAt", -1).to_list(length=200)
        total = len(apps)
        approved = sum(1 for a in apps if a.get("status") == "approved")
        rejected = sum(1 for a in apps if a.get("status") == "rejected")
        pending = sum(1 for a in apps if a.get("status") in ["submitted", "under_review"])

        # Services applied
        service_counts: dict = {}
        for a in apps:
            svc = a.get("serviceName", "Unknown")
            service_counts[svc] = service_counts.get(svc, 0) + 1
        by_service = [{"name": k, "value": v} for k, v in sorted(service_counts.items(), key=lambda x: -x[1])]
        most_used = by_service[0]["name"] if by_service else "None"

        # Monthly (last 6 months)
        monthly = []
        for i in range(5, -1, -1):
            start = (datetime.utcnow().replace(day=1) - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0)
            end = (start + timedelta(days=32)).replace(day=1)
            count = sum(1 for a in apps if start <= a.get("createdAt", datetime.min) < end)
            monthly.append({"month": start.strftime("%b"), "applications": count})

        # Processing times (approved apps)
        proc_times = []
        for a in apps:
            if a.get("status") == "approved" and a.get("createdAt") and a.get("updatedAt"):
                diff = (a["updatedAt"] - a["createdAt"]).days
                proc_times.append(diff)
        avg_processing = round(sum(proc_times) / len(proc_times), 1) if proc_times else 0
        success_rate = round((approved / total * 100), 1) if total > 0 else 0

        # Recent activity
        recent = [{"service": a.get("serviceName", ""), "status": a.get("status", ""),
                   "date": a["createdAt"].isoformat() if isinstance(a.get("createdAt"), datetime) else str(a.get("createdAt", ""))}
                  for a in apps[:5]]

        return {"success": True, "data": {
            "total": total, "approved": approved, "rejected": rejected, "pending": pending,
            "by_service": by_service, "most_used": most_used, "monthly": monthly,
            "avg_processing": avg_processing, "success_rate": success_rate, "recent": recent,
        }}
    return {"success": True, "data": {
        "total": 0, "approved": 0, "rejected": 0, "pending": 0,
        "by_service": [], "most_used": "None", "monthly": [],
        "avg_processing": 0, "success_rate": 0, "recent": [],
    }}


@router.get("/admin")
async def get_admin_stats(user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        total = await db.applications.count_documents({})
        approved = await db.applications.count_documents({"status": "approved"})
        pending = await db.applications.count_documents({"status": {"$in": ["submitted", "under_review"]}})
        rejected = await db.applications.count_documents({"status": "rejected"})
        users = await db.users.count_documents({})
        return {"success": True, "data": {
            "total": total, "approved": approved, "pending": pending,
            "rejected": rejected, "users": users,
        }}
    return {"success": True, "data": {"total": 605, "approved": 512, "pending": 58, "rejected": 35, "users": 1240}}
