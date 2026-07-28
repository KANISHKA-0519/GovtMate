"""Agent 6: Workflow Agent - Assigns departments, manages routing and status."""
from datetime import datetime, timedelta
from agents.state import GraphState
import logging

logger = logging.getLogger(__name__)

DEPARTMENT_MAP = {
    "birth_certificate": {"dept": "Municipal Corporation", "officer": "Birth Registration Officer", "days": 7},
    "income_certificate": {"dept": "Revenue Department", "officer": "Tehsildar", "days": 10},
    "caste_certificate": {"dept": "Revenue Department", "officer": "Sub-Divisional Magistrate", "days": 15},
    "domicile_certificate": {"dept": "Revenue Department", "officer": "Tehsildar", "days": 10},
    "ration_card": {"dept": "Food & Civil Supplies", "officer": "Supply Inspector", "days": 21},
    "pension_scheme": {"dept": "Social Welfare Department", "officer": "District Social Welfare Officer", "days": 30},
    "scholarship": {"dept": "Education Department", "officer": "District Education Officer", "days": 20},
    "health_card": {"dept": "Health Department", "officer": "Chief Medical Officer", "days": 14},
    "pm_awas": {"dept": "Housing Department", "officer": "District Collector", "days": 45},
    "kisan_credit": {"dept": "Agriculture Department", "officer": "Agriculture Officer", "days": 14},
}

WORKFLOW_STAGES = [
    {"id": "s1", "name": "Document Submission", "agent": "Citizen"},
    {"id": "s2", "name": "Document Verification", "agent": "Document Verification Agent"},
    {"id": "s3", "name": "Eligibility Verification", "agent": "Eligibility Agent"},
    {"id": "s4", "name": "Scheme Recommendation", "agent": "Scheme Recommendation Agent"},
    {"id": "s5", "name": "Waiting for Admin Review", "agent": "Workflow Agent"},
    {"id": "s6", "name": "Admin Review", "agent": "Administrator"},
    {"id": "s7", "name": "Certificate Issuance", "agent": "Transparency Agent"},
]


async def workflow_agent(state: GraphState) -> GraphState:
    logger.info(f"[Workflow] Processing application {state['application_id']}")

    service_type = state.get("service_type", "")
    dept_info = DEPARTMENT_MAP.get(service_type, {
        "dept": "Government Department",
        "officer": "Processing Officer",
        "days": 14,
    })

    eligibility = state.get("eligibility_result", {})
    is_eligible = eligibility.get("isEligible", True)
    verification = state.get("verification_result", {})
    docs_valid = verification.get("isValid", True)

    # Determine status: Always go to waiting_admin_review for administrator approval
    if not docs_valid:
        new_status = "documents_required"
        stage_name = "Document Review"
    else:
        new_status = "waiting_admin_review"
        stage_name = "Waiting for Admin Review"

    # Build workflow stages
    stages = []
    for i, stage in enumerate(WORKFLOW_STAGES):
        if i <= 1:
            s_status = "completed"
        elif i == 2:
            s_status = "completed" if docs_valid else "active"
        elif i == 3:
            s_status = "completed" if (docs_valid and is_eligible) else "pending"
        elif i == 4:
            s_status = "active" if docs_valid else "pending"
        else:
            s_status = "pending"
        stages.append({**stage, "status": s_status, "startedAt": datetime.utcnow().isoformat() if s_status != "pending" else None})

    estimated_completion = (datetime.utcnow() + timedelta(days=dept_info["days"])).isoformat()

    workflow_result = {
        **state.get("workflow_result", {}),
        "department": dept_info["dept"],
        "assignedOfficer": dept_info["officer"],
        "estimatedDays": dept_info["days"],
        "estimatedCompletion": estimated_completion,
        "status": new_status,
        "stages": stages,
        "currentStage": stage_name,
        "requiresAdminApproval": True,
    }

    timeline_event = {
        "id": f"ts_{datetime.utcnow().timestamp()}",
        "stage": "Workflow Assignment",
        "description": f"Assigned to {dept_info['dept']}. Officer: {dept_info['officer']}. Est. {dept_info['days']} days. Awaiting administrator review.",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "Workflow Agent",
    }

    return {
        **state,
        "current_stage": "notification",
        "workflow_result": workflow_result,
        "timeline": [timeline_event],
    }
