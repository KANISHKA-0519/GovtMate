"""Multi-agent orchestrator for GovAssist AI."""
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

_workflow = None
_has_langgraph = False

try:
    from langgraph.graph import StateGraph, END

    def build_workflow():
        graph = StateGraph(GraphState)
        graph.add_node("citizen_support", citizen_support_agent)
        graph.add_node("form_filling", form_filling_agent)
        graph.add_node("document_verification", document_verification_agent)
        graph.add_node("eligibility_check", eligibility_agent)
        graph.add_node("scheme_recommendation", scheme_recommendation_agent)
        graph.add_node("workflow", workflow_agent)
        graph.add_node("notification", notification_agent)
        graph.add_node("transparency", transparency_agent)

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

    _workflow = build_workflow()
    _has_langgraph = True
except Exception as e:
    logger.warning(f"LangGraph unavailable or blocked ({e}). Falling back to sequential agent pipeline.")


def get_workflow():
    global _workflow
    return _workflow


async def _run_sequential_pipeline(initial_state: GraphState) -> GraphState:
    state = dict(initial_state)
    state = await citizen_support_agent(state)
    state = await form_filling_agent(state)
    state = await document_verification_agent(state)
    state = await eligibility_agent(state)
    state = await scheme_recommendation_agent(state)
    state = await workflow_agent(state)
    state = await notification_agent(state)
    state = await transparency_agent(state)
    return state


async def run_workflow(
    application_id: str,
    user_id: str,
    service_type: str,
    service_name: str,
    documents: list,
    user_data: dict,
) -> dict:
    """Run the complete multi-agent workflow for an application."""
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
        if _has_langgraph and _workflow:
            final_state = await _workflow.ainvoke(initial_state)
        else:
            final_state = await _run_sequential_pipeline(initial_state)
        logger.info(f"Workflow completed for application {application_id}")
        return {"success": True, "state": final_state}
    except Exception as e:
        logger.error(f"Workflow failed for {application_id}: {e}")
        return {"success": False, "error": str(e), "state": initial_state}
