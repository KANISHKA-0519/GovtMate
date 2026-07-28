"""Agent 1: Citizen Support Agent - Understands user requests and guides citizens."""
from datetime import datetime
from agents.state import GraphState
from agents.llm_client import call_llm
import logging

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a helpful Indian government services assistant. 
Your role is to understand citizen requests, identify the government service needed, 
and provide clear guidance. Be concise, friendly, and professional.
Always respond in English. Focus on practical steps."""

SERVICE_DEPARTMENTS = {
    "birth_certificate": "Municipal Corporation",
    "income_certificate": "Revenue Department",
    "caste_certificate": "Revenue Department",
    "domicile_certificate": "Revenue Department",
    "ration_card": "Food & Civil Supplies Department",
    "pension_scheme": "Social Welfare Department",
    "scholarship": "Education Department",
    "health_card": "Health Department",
    "pm_awas": "Housing Department",
    "kisan_credit": "Agriculture Department",
}


async def citizen_support_agent(state: GraphState) -> GraphState:
    logger.info(f"[CitizenSupport] Processing application {state['application_id']}")

    department = SERVICE_DEPARTMENTS.get(state["service_type"], "Government Department")

    prompt = f"""
    A citizen has requested: {state['service_name']}
    Service Type: {state['service_type']}
    Department: {department}
    
    Provide a brief acknowledgment and list the key documents typically required.
    Keep response under 100 words.
    """

    response = await call_llm(prompt, SYSTEM_PROMPT)

    timeline_event = {
        "id": f"ts_{datetime.utcnow().timestamp()}",
        "stage": "Citizen Support",
        "description": f"Request received for {state['service_name']}. Routed to {department}.",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "Citizen Support Agent",
    }

    return {
        **state,
        "current_stage": "form_filling",
        "workflow_result": {**state.get("workflow_result", {}), "department": department},
        "timeline": [timeline_event],
        "messages": [{"role": "assistant", "content": response, "agent": "Citizen Support"}],
    }
