"""LangGraph multi-agent orchestrator for GovAssist AI."""
from langgraph.graph import StateGraph, END
from agents.state import GraphState
from agents.citizen_support import citizen_support_agent
from agents.form_filling import form_filling_agent
from agents.document_verification import document_verification_agent
from agents.eligibility import eligibility_agent
from agents.scheme_recommendation import scheme_recommendation_agent
from agents.workflow import workflow_agent
from agents.notification import notification_agent
from agents.transparency import transparency_agent
import logging

logger = logging.getLogger(__name__)


def build_workflow() -> StateGraph:
    """Build the LangGraph multi-agent workflow."""
    graph = StateGraph(GraphState)

    # Add all agent nodes
    graph.add_node("citizen_support", citizen_support_agent)
    graph.add_node("form_filling", form_filling_agent)
    graph.add_node("document_verification", document_verification_agent)
    graph.add_node("eligibility_check", eligibility_agent)
    graph.add_node("scheme_recommendation", scheme_recommendation_agent)
    graph.add_node("workflow", workflow_agent)
    graph.add_node("notification", notification_agent)
    graph.add_node("transparency", transparency_agent)

    # Define the sequential flow
    graph.set_entry_point("citizen_support")
    graph.add_edge("citizen_support", "form_filling")
    graph.add_edge("form_filling", "document_verification")
    graph.add_edge("document_verification", "eligibility_check")
    graph.add_edge("eligibility_check", "scheme_recommendation")
    graph.add_edge("scheme_recommendation", "workflow")
    graph.add_edge("workflow", "notification")
    graph.add_edge("notification", "transparency")
    graph.add_edge("transparency", END)

    return graph.compile()


# Singleton compiled workflow
_workflow = None


def get_workflow():
    global _workflow
    if _workflow is None:
        _workflow = build_workflow()
    return _workflow


async def run_workflow(
    application_id: str,
    user_id: str,
    service_type: str,
    service_name: str,
    documents: list,
    user_data: dict,
) -> dict:
    """Run the complete multi-agent workflow for an application."""
    workflow = get_workflow()

    initial_state: GraphState = {
        "application_id": application_id,
        "user_id": user_id,
        "service_type": service_type,
        "service_name": service_name,
        "documents": documents,
        "user_data": user_data,
        "ocr_results": {},
        "form_data": {},
        "verification_result": {},
        "eligibility_result": {},
        "recommendations": [],
        "workflow_result": {},
        "notifications": [],
        "timeline": [],
        "current_stage": "citizen_support",
        "errors": [],
        "messages": [],
    }

    try:
        logger.info(f"Starting workflow for application {application_id}")
        final_state = await workflow.ainvoke(initial_state)
        logger.info(f"Workflow completed for application {application_id}")
        return {"success": True, "state": final_state}
    except Exception as e:
        logger.error(f"Workflow failed for {application_id}: {e}")
        return {"success": False, "error": str(e), "state": initial_state}
