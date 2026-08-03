"""Agent 7: Notification Agent - Sends notifications about application status."""
from datetime import datetime
from agents.state import GraphState
import logging

logger = logging.getLogger(__name__)


async def notification_agent(state: GraphState) -> GraphState:
    logger.info(f"[Notification] Processing application {state['application_id']}")

    workflow = state.get("workflow_result", {})
    eligibility = state.get("eligibility_result", {})
    verification = state.get("verification_result", {})
    service_name = state.get("service_name", "your application")

    notifications = []

    import uuid

    # Application received notification
    notifications.append({
        "id": f"notif_{uuid.uuid4().hex[:8]}",
        "userId": state["user_id"],
        "title": "Application Received",
        "message": f"Your application for {service_name} has been received and is being processed.",
        "type": "info",
        "read": False,
        "applicationId": state["application_id"],
        "createdAt": datetime.utcnow().isoformat(),
    })

    # Document status
    if not verification.get("isValid", True):
        missing = verification.get("missingDocuments", [])
        notifications.append({
            "id": f"notif_{uuid.uuid4().hex[:8]}",
            "userId": state["user_id"],
            "title": "Documents Required",
            "message": f"Please upload missing documents: {', '.join(missing)}",
            "type": "warning",
            "read": False,
            "applicationId": state["application_id"],
            "createdAt": datetime.utcnow().isoformat(),
        })
    else:
        notifications.append({
            "id": f"notif_{uuid.uuid4().hex[:8]}",
            "userId": state["user_id"],
            "title": "Documents Verified",
            "message": f"All documents for {service_name} have been verified successfully.",
            "type": "success",
            "read": False,
            "applicationId": state["application_id"],
            "createdAt": datetime.utcnow().isoformat(),
        })

    # Eligibility notification
    if eligibility.get("isEligible"):
        notifications.append({
            "id": f"notif_{uuid.uuid4().hex[:8]}",
            "userId": state["user_id"],
            "title": "Eligibility Confirmed",
            "message": f"You are eligible for {service_name}. Score: {eligibility.get('score', 0)}%",
            "type": "success",
            "read": False,
            "applicationId": state["application_id"],
            "createdAt": datetime.utcnow().isoformat(),
        })

    # Department assignment
    dept = workflow.get("department", "")
    if dept:
        days = workflow.get("estimatedDays", 14)
        notifications.append({
            "id": f"notif_{uuid.uuid4().hex[:8]}",
            "userId": state["user_id"],
            "title": "Application Forwarded",
            "message": f"Your application has been forwarded to {dept}. Expected completion: {days} working days.",
            "type": "info",
            "read": False,
            "applicationId": state["application_id"],
            "createdAt": datetime.utcnow().isoformat(),
        })

    # Scheme recommendations
    recs = state.get("recommendations", [])
    if recs:
        notifications.append({
            "id": f"notif_{uuid.uuid4().hex[:8]}",
            "userId": state["user_id"],
            "title": "New Scheme Recommendations",
            "message": f"Based on your profile, you may be eligible for {len(recs)} additional welfare schemes.",
            "type": "info",
            "read": False,
            "applicationId": state["application_id"],
            "createdAt": datetime.utcnow().isoformat(),
        })

    timeline_event = {
        "id": f"ts_{datetime.utcnow().timestamp()}",
        "stage": "Notifications Sent",
        "description": f"Sent {len(notifications)} notifications to citizen.",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "Notification Agent",
    }

    return {
        **state,
        "current_stage": "transparency",
        "notifications": notifications,
        "timeline": [timeline_event],
    }
