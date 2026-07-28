from fastapi import APIRouter, Depends, Header, HTTPException
from agents.llm_client import call_llm
from agents.orchestrator import get_workflow
from database.connection import get_db
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

router = APIRouter(prefix="/api/agents", tags=["agents"])
logger = logging.getLogger(__name__)

CITIZEN_SUPPORT_SYSTEM = """You are GovAssist AI, a helpful Indian government services assistant.
Help citizens with government certificates, welfare schemes, and application guidance.
Be concise, friendly, and practical. Provide step-by-step guidance when asked.
Always mention required documents and processing time."""


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return authorization.replace("Bearer ", "")


@router.post("/chat")
async def chat_with_agent(request: ChatRequest, user_id: str = Depends(get_user_id)):
    context_str = ""
    if request.context:
        context_str = f"\nUser context: {request.context}"

    prompt = f"{request.message}{context_str}"
    reply = await call_llm(prompt, CITIZEN_SUPPORT_SYSTEM)

    suggestions = _get_suggestions(request.message)

    return {"success": True, "data": {"reply": reply, "suggestions": suggestions}}


@router.get("/workflow/{application_id}")
async def get_workflow_status(application_id: str, user_id: str = Depends(get_user_id)):
    db = get_db()
    if db is not None:
        app = await db.applications.find_one({"id": application_id})
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        return {"success": True, "data": {
            "applicationId": application_id,
            "status": app.get("status", "submitted"),
            "workflowStage": app.get("workflowStage", {}),
            "timeline": app.get("timeline", []),
        }}
    return {"success": True, "data": {"applicationId": application_id, "status": "processing"}}


def _get_suggestions(message: str) -> list:
    msg = message.lower()
    if "birth" in msg:
        return ["What documents are needed?", "How long does it take?", "Track my application"]
    if "income" in msg or "certificate" in msg:
        return ["Check eligibility", "Upload documents", "View welfare schemes"]
    if "scheme" in msg or "welfare" in msg:
        return ["PM Awas Yojana", "Ayushman Bharat", "National Scholarship"]
    return ["Apply for certificate", "Check application status", "View recommendations"]
