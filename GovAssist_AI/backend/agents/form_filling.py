"""Agent 2: Smart Form Filling Agent - Auto-fills forms from OCR data."""
from datetime import datetime
from agents.state import GraphState
from agents.llm_client import call_llm
import json
import logging

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a form-filling assistant for Indian government services.
Extract and map data from OCR results to fill application forms accurately.
Return ONLY valid JSON with the extracted fields. No explanation."""


async def form_filling_agent(state: GraphState) -> GraphState:
    logger.info(f"[FormFilling] Processing application {state['application_id']}")

    ocr_data = state.get("ocr_results", {})
    user_data = state.get("user_data", {})

    # Build form data from available sources
    form_data = {
        "applicantName": user_data.get("name", ocr_data.get("name", "")),
        "dateOfBirth": user_data.get("dateOfBirth", ocr_data.get("dob", "")),
        "gender": user_data.get("gender", ocr_data.get("gender", "")),
        "aadhaarNumber": user_data.get("aadhaar", ocr_data.get("aadhaar_number", "")),
        "address": user_data.get("address", ocr_data.get("address", "")),
        "state": user_data.get("state", ""),
        "district": user_data.get("district", ""),
        "category": user_data.get("category", "general"),
        "annualIncome": str(user_data.get("annualIncome", "")),
        "serviceType": state["service_type"],
        "serviceName": state["service_name"],
    }

    if ocr_data:
        prompt = f"""
        OCR extracted data: {json.dumps(ocr_data, indent=2)}
        User profile: {json.dumps(user_data, indent=2)}
        Service: {state['service_name']}
        
        Fill the application form fields as JSON. Include: applicantName, dateOfBirth, 
        gender, aadhaarNumber, address, category, annualIncome, fatherName, motherName.
        Return only JSON.
        """
        try:
            response = await call_llm(prompt, SYSTEM_PROMPT)
            # Try to parse LLM response as JSON
            start = response.find("{")
            end = response.rfind("}") + 1
            if start >= 0 and end > start:
                llm_form = json.loads(response[start:end])
                form_data.update({k: v for k, v in llm_form.items() if v})
        except Exception as e:
            logger.warning(f"Form filling LLM parse error: {e}")

    timeline_event = {
        "id": f"ts_{datetime.utcnow().timestamp()}",
        "stage": "Form Auto-Fill",
        "description": f"Application form auto-filled with {len([v for v in form_data.values() if v])} fields from documents.",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "Smart Form Filling Agent",
    }

    return {
        **state,
        "current_stage": "document_verification",
        "form_data": form_data,
        "timeline": [timeline_event],
    }
