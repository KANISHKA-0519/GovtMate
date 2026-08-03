from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
from models.schemas import ApplicationCreate, ApplicationDB, TimelineEvent, WorkflowStage, Stage
from database.connection import get_db
from agents.orchestrator import run_workflow
from datetime import datetime
from typing import Optional
import logging

router = APIRouter(prefix="/api/applications", tags=["applications"])
logger = logging.getLogger(__name__)


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
        elif isinstance(v, list):
            doc[k] = [_serialize(i) if isinstance(i, dict) else i for i in v]
        elif isinstance(v, dict):
            doc[k] = _serialize(v)
    return doc


_mock_applications_db: dict[str, list[dict]] = {}
_mock_all_apps: dict[str, dict] = {}


@router.post("")
async def create_application(data: ApplicationCreate, user_id: str = Depends(get_user_id)):
    app = ApplicationDB(
        userId=user_id,
        serviceType=data.serviceType,
        serviceName=data.serviceName,
        documents=data.documents,
        formData=data.formData,
        timeline=[TimelineEvent(
            stage="Application Submitted",
            description=f"Application for {data.serviceName} submitted successfully.",
            status="completed",
            agent="System",
        )],
        workflowStage=WorkflowStage(
            current="submitted",
            stages=[
                Stage(id="s1", name="Document Submission", status="completed", agent="Citizen"),
                Stage(id="s2", name="Document Verification", status="pending", agent="Document Verification Agent"),
                Stage(id="s3", name="Eligibility Verification", status="pending", agent="Eligibility Agent"),
                Stage(id="s4", name="Scheme Recommendation", status="pending", agent="Scheme Recommendation Agent"),
                Stage(id="s5", name="Waiting for Admin Review", status="pending", agent="Workflow Agent"),
                Stage(id="s6", name="Admin Review", status="pending", agent="Administrator"),
                Stage(id="s7", name="Certificate Issuance", status="pending", agent="Transparency Agent"),
            ]
        )
    )
    app_dict = app.model_dump()

    db = get_db()
    if db is not None:
        await db.applications.insert_one(app_dict)
    else:
        if user_id not in _mock_applications_db:
            _mock_applications_db[user_id] = []
        _mock_applications_db[user_id].insert(0, app_dict)
        _mock_all_apps[app.id] = app_dict
        logger.info(f"Mock: Created application {app.id}")

    return {"success": True, "data": _serialize(app_dict)}


@router.get("")
async def list_applications(user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        cursor = db.applications.find({"userId": user_id}).sort("createdAt", -1)
        apps = await cursor.to_list(length=100)
        return {"success": True, "data": [_serialize(a) for a in apps]}
    apps = _mock_applications_db.get(user_id, [])
    return {"success": True, "data": [_serialize(a) for a in apps]}


@router.get("/{app_id}")
async def get_application(app_id: str, user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        app = await db.applications.find_one({"id": app_id})
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        return {"success": True, "data": _serialize(app)}
    app = _mock_all_apps.get(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"success": True, "data": _serialize(app)}


@router.put("/{app_id}")
async def update_application(app_id: str, data: dict, user_id: str = Depends(get_user_id)):
    db = get_db()
    data["updatedAt"] = datetime.utcnow()
    if db is not None:
        await db.applications.update_one({"id": app_id, "userId": user_id}, {"$set": data})
        app = await db.applications.find_one({"id": app_id})
        return {"success": True, "data": _serialize(app)}
    if app_id in _mock_all_apps:
        _mock_all_apps[app_id].update(data)
    return {"success": True, "data": data}


@router.post("/{app_id}/workflow")
async def run_application_workflow(app_id: str, background_tasks: BackgroundTasks, user_id: str = Depends(get_user_id)):
    db = get_db()
    app_data = None

    if db is not None:
        app_data = await db.applications.find_one({"id": app_id})
        if not app_data:
            raise HTTPException(status_code=404, detail="Application not found")
        user_data = await db.users.find_one({"clerkId": user_id}) or {}
        docs = await db.documents.find({"id": {"$in": app_data.get("documents", [])}}).to_list(length=20)
    else:
        app_data = _mock_all_apps.get(app_id, {"id": app_id, "serviceType": "income_certificate", "serviceName": "Income Certificate", "documents": []})
        from routes.users import _mock_users_db
        user_data = _mock_users_db.get(user_id, {})
        from routes.documents import _mock_documents_db
        docs = _mock_documents_db.get(user_id, [])

    background_tasks.add_task(
        _execute_workflow,
        app_id=app_id,
        user_id=user_id,
        app_data=app_data,
        user_data=user_data,
        docs=docs,
    )

    return {"success": True, "data": {"message": "Workflow started", "applicationId": app_id}}


async def _execute_workflow(app_id: str, user_id: str, app_data: dict, user_data: dict, docs: list):
    try:
        result = await run_workflow(
            application_id=app_id,
            user_id=user_id,
            service_type=app_data.get("serviceType", ""),
            service_name=app_data.get("serviceName", ""),
            documents=[{"type": d.get("type", "other"), "name": d.get("name", ""), "url": d.get("url", "")} for d in docs],
            user_data={k: v for k, v in user_data.items() if k != "_id"},
        )

        if result["success"]:
            state = result["state"]
            workflow_result = state.get("workflow_result", {})
            db = get_db()
            update = {
                "status": workflow_result.get("status", "under_review"),
                "department": workflow_result.get("department", ""),
                "assignedOfficer": workflow_result.get("assignedOfficer", ""),
                "estimatedCompletion": workflow_result.get("estimatedCompletion"),
                "eligibilityResult": state.get("eligibility_result", {}),
                "recommendations": state.get("recommendations", []),
                "formData": state.get("form_data", {}),
                "timeline": [_serialize_event(e) for e in state.get("timeline", [])],
                "workflowStage": {
                    "current": state.get("current_stage", "completed"),
                    "stages": workflow_result.get("stages", []),
                },
                "updatedAt": datetime.utcnow(),
            }
            if db is not None:
                await db.applications.update_one({"id": app_id}, {"$set": update})

                # Save notifications
                for notif in state.get("notifications", []):
                    from models.schemas import NotificationDB
                    n = NotificationDB(**notif)
                    await db.notifications.insert_one(n.model_dump())
            else:
                if app_id in _mock_all_apps:
                    _mock_all_apps[app_id].update(update)
                from routes.notifications import _mock_notifications_db
                if user_id not in _mock_notifications_db:
                    _mock_notifications_db[user_id] = []
                for notif in state.get("notifications", []):
                    _mock_notifications_db[user_id].insert(0, _serialize(notif))

    except Exception as e:
        logger.error(f"Workflow execution error for {app_id}: {e}")


def _serialize_event(event: dict) -> dict:
    if isinstance(event, dict):
        return {k: v.isoformat() if isinstance(v, datetime) else v for k, v in event.items()}
    return event
