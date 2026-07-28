"""Agent 3: Document Verification Agent - OCR, extraction, and verification."""
from datetime import datetime
from agents.state import GraphState
from agents.llm_client import call_llm
import logging

logger = logging.getLogger(__name__)

REQUIRED_DOCS = {
    "birth_certificate": ["aadhaar", "photo"],
    "income_certificate": ["aadhaar", "pan", "bank_passbook"],
    "caste_certificate": ["aadhaar", "residence_proof"],
    "domicile_certificate": ["aadhaar", "residence_proof"],
    "ration_card": ["aadhaar", "residence_proof", "photo"],
    "pension_scheme": ["aadhaar", "bank_passbook", "photo"],
    "scholarship": ["aadhaar", "income_certificate", "photo"],
    "health_card": ["aadhaar", "photo"],
    "pm_awas": ["aadhaar", "income_certificate", "bank_passbook"],
    "kisan_credit": ["aadhaar", "bank_passbook"],
}


async def document_verification_agent(state: GraphState) -> GraphState:
    logger.info(f"[DocVerification] Processing application {state['application_id']}")

    documents = state.get("documents", [])
    service_type = state.get("service_type", "")
    required = REQUIRED_DOCS.get(service_type, ["aadhaar"])

    uploaded_types = [doc.get("type", "") for doc in documents]
    missing = [r for r in required if r not in uploaded_types]

    verified_count = 0
    issues = []
    ocr_results = {}

    for doc in documents:
        doc_type = doc.get("type", "other")
        doc_name = doc.get("name", "document")

        # Simulate OCR extraction
        extracted = _simulate_ocr(doc_type, state.get("user_data", {}))
        ocr_results[doc_type] = extracted
        verified_count += 1

    confidence = min(100, (verified_count / max(len(required), 1)) * 100)
    is_valid = len(missing) == 0 and verified_count > 0

    if missing:
        issues.append(f"Missing documents: {', '.join(missing)}")

    verification_result = {
        "isValid": is_valid,
        "confidence": round(confidence, 1),
        "verifiedCount": verified_count,
        "missingDocuments": missing,
        "issues": issues,
        "verifiedAt": datetime.utcnow().isoformat(),
    }

    status = "completed" if is_valid else "active"
    description = (
        f"Verified {verified_count} documents with {confidence:.0f}% confidence."
        if is_valid
        else f"Verification incomplete. Missing: {', '.join(missing)}."
    )

    timeline_event = {
        "id": f"ts_{datetime.utcnow().timestamp()}",
        "stage": "Document Verification",
        "description": description,
        "status": status,
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "Document Verification Agent",
    }

    return {
        **state,
        "current_stage": "eligibility_check",
        "ocr_results": {**state.get("ocr_results", {}), **ocr_results},
        "verification_result": verification_result,
        "timeline": [timeline_event],
    }


def _simulate_ocr(doc_type: str, user_data: dict) -> dict:
    """Simulate OCR extraction based on document type."""
    base = {
        "name": user_data.get("name", "Citizen Name"),
        "dob": user_data.get("dateOfBirth", "01/01/1990"),
        "address": user_data.get("address", "123, Main Street, City"),
    }
    if doc_type == "aadhaar":
        return {**base, "aadhaar_number": user_data.get("aadhaar", "XXXX XXXX XXXX"), "gender": user_data.get("gender", "Male")}
    if doc_type == "pan":
        return {**base, "pan_number": "ABCDE1234F", "father_name": "Father Name"}
    if doc_type == "income_certificate":
        return {**base, "annual_income": str(user_data.get("annualIncome", "200000")), "issuing_authority": "Revenue Department"}
    return base
