"""Agent 8: Transparency Agent - Builds complete audit trail and progress tracking."""
from datetime import datetime
from agents.state import GraphState
import logging

logger = logging.getLogger(__name__)


async def transparency_agent(state: GraphState) -> GraphState:
    logger.info(f"[Transparency] Processing application {state['application_id']}")

    workflow = state.get("workflow_result", {})
    eligibility = state.get("eligibility_result", {})
    verification = state.get("verification_result", {})

    # Calculate overall progress
    checks = [
        bool(state.get("documents")),
        verification.get("isValid", False),
        eligibility.get("isEligible", False),
        bool(workflow.get("department")),
    ]
    progress = round((sum(checks) / len(checks)) * 100, 1)

    transparency_summary = {
        "applicationId": state["application_id"],
        "serviceType": state["service_type"],
        "serviceName": state["service_name"],
        "currentStage": workflow.get("currentStage", "Processing"),
        "department": workflow.get("department", ""),
        "assignedOfficer": workflow.get("assignedOfficer", ""),
        "estimatedCompletion": workflow.get("estimatedCompletion", ""),
        "progress": progress,
        "eligibilityScore": eligibility.get("score", 0),
        "documentsVerified": verification.get("verifiedCount", 0),
        "recommendationsCount": len(state.get("recommendations", [])),
        "totalTimelineEvents": len(state.get("timeline", [])) + 1,
        "generatedAt": datetime.utcnow().isoformat(),
    }

    timeline_event = {
        "id": f"ts_{datetime.utcnow().timestamp()}",
        "stage": "Transparency Report",
        "description": f"Application processing complete. Progress: {progress}%. All agents executed successfully.",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "Transparency Agent",
    }

    return {
        **state,
        "current_stage": "completed",
        "workflow_result": {**workflow, "transparency": transparency_summary},
        "timeline": [timeline_event],
    }
