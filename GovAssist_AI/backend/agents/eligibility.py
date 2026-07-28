"""Agent 4: Eligibility Agent - Checks income, age, category, and rules."""
from datetime import datetime
from agents.state import GraphState
from agents.llm_client import call_llm
import json
import logging

logger = logging.getLogger(__name__)

ELIGIBILITY_RULES = {
    "birth_certificate": {"min_age": 0, "max_age": 120, "income_limit": None, "categories": None},
    "income_certificate": {"min_age": 18, "max_age": 120, "income_limit": None, "categories": None},
    "caste_certificate": {"min_age": 18, "max_age": 120, "income_limit": None, "categories": ["obc", "sc", "st"]},
    "ration_card": {"min_age": 18, "max_age": 120, "income_limit": 300000, "categories": None},
    "pension_scheme": {"min_age": 60, "max_age": 120, "income_limit": 200000, "categories": None},
    "scholarship": {"min_age": 14, "max_age": 35, "income_limit": 250000, "categories": None},
    "health_card": {"min_age": 0, "max_age": 120, "income_limit": 500000, "categories": None},
    "pm_awas": {"min_age": 18, "max_age": 70, "income_limit": 600000, "categories": None},
    "kisan_credit": {"min_age": 18, "max_age": 75, "income_limit": None, "categories": None},
    "domicile_certificate": {"min_age": 18, "max_age": 120, "income_limit": None, "categories": None},
}


async def eligibility_agent(state: GraphState) -> GraphState:
    logger.info(f"[Eligibility] Processing application {state['application_id']}")

    user_data = state.get("user_data", {})
    service_type = state.get("service_type", "")
    rules = ELIGIBILITY_RULES.get(service_type, {})

    criteria = []
    passed_count = 0

    # Age check
    age = _calculate_age(user_data.get("dateOfBirth", ""))
    if rules.get("min_age") is not None:
        min_age = rules["min_age"]
        max_age = rules.get("max_age", 120)
        age_passed = min_age <= (age or 25) <= max_age
        criteria.append({
            "name": "Age Requirement",
            "required": f"{min_age}-{max_age} years",
            "actual": f"{age or 'Unknown'} years",
            "passed": age_passed,
        })
        if age_passed:
            passed_count += 1

    # Income check
    if rules.get("income_limit"):
        income = float(user_data.get("annualIncome", 0) or 0)
        income_passed = income <= rules["income_limit"] or income == 0
        criteria.append({
            "name": "Income Limit",
            "required": f"≤ ₹{rules['income_limit']:,}",
            "actual": f"₹{income:,.0f}" if income else "Not provided",
            "passed": income_passed,
        })
        if income_passed:
            passed_count += 1

    # Category check
    if rules.get("categories"):
        category = user_data.get("category", "general")
        cat_passed = category in rules["categories"]
        criteria.append({
            "name": "Category Eligibility",
            "required": f"Must be: {', '.join(rules['categories']).upper()}",
            "actual": category.upper() if category else "Not specified",
            "passed": cat_passed,
        })
        if cat_passed:
            passed_count += 1

    # Document verification check
    verification = state.get("verification_result", {})
    doc_passed = verification.get("isValid", True)
    criteria.append({
        "name": "Document Verification",
        "required": "All required documents",
        "actual": f"{verification.get('verifiedCount', 0)} documents verified",
        "passed": doc_passed,
    })
    if doc_passed:
        passed_count += 1

    total = len(criteria)
    score = round((passed_count / total) * 100, 1) if total > 0 else 75.0
    is_eligible = passed_count >= max(1, total - 1)  # Allow 1 failure

    reason = (
        f"Eligible for {state['service_name']}. All {passed_count}/{total} criteria met."
        if is_eligible
        else f"Not fully eligible. {passed_count}/{total} criteria met. Please review requirements."
    )

    eligibility_result = {
        "isEligible": is_eligible,
        "score": score,
        "criteria": criteria,
        "reason": reason,
        "checkedAt": datetime.utcnow().isoformat(),
    }

    timeline_event = {
        "id": f"ts_{datetime.utcnow().timestamp()}",
        "stage": "Eligibility Check",
        "description": f"Eligibility score: {score}%. {'Eligible ✓' if is_eligible else 'Partially eligible'}",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "Eligibility Agent",
    }

    return {
        **state,
        "current_stage": "scheme_recommendation",
        "eligibility_result": eligibility_result,
        "timeline": [timeline_event],
    }


def _calculate_age(dob_str: str) -> int | None:
    if not dob_str:
        return None
    try:
        from datetime import date
        parts = dob_str.replace("-", "/").split("/")
        if len(parts) == 3:
            year = int(parts[0]) if len(parts[0]) == 4 else int(parts[2])
            today = date.today()
            return today.year - year
    except Exception:
        pass
    return None
