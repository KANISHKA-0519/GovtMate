"""Agent 5: Scheme Recommendation Agent - Recommends additional welfare schemes."""
from datetime import datetime
from agents.state import GraphState
from agents.llm_client import call_llm
import logging

logger = logging.getLogger(__name__)

ALL_SCHEMES = [
    {
        "id": "pm_awas_yojana",
        "name": "PM Awas Yojana",
        "description": "Housing for All - Affordable housing scheme for urban and rural poor",
        "ministry": "Ministry of Housing & Urban Affairs",
        "benefits": ["Subsidy up to ₹2.67 lakh", "Interest subsidy on home loans", "Pucca house construction"],
        "eligibility": ["Annual income < ₹6 lakh", "No pucca house", "Age 18-70"],
        "applicationUrl": "https://pmaymis.gov.in",
        "category": "housing",
        "income_limit": 600000,
        "min_age": 18,
    },
    {
        "id": "ayushman_bharat",
        "name": "Ayushman Bharat - PMJAY",
        "description": "Health coverage of ₹5 lakh per family per year",
        "ministry": "Ministry of Health & Family Welfare",
        "benefits": ["₹5 lakh health coverage", "Cashless treatment", "1500+ procedures covered"],
        "eligibility": ["BPL families", "SECC database listed", "No income limit for rural"],
        "applicationUrl": "https://pmjay.gov.in",
        "category": "health",
        "income_limit": 300000,
        "min_age": 0,
    },
    {
        "id": "pm_kisan",
        "name": "PM-KISAN Samman Nidhi",
        "description": "Income support of ₹6000/year to farmer families",
        "ministry": "Ministry of Agriculture",
        "benefits": ["₹6000 per year", "Direct bank transfer", "3 installments of ₹2000"],
        "eligibility": ["Small & marginal farmers", "Land holding ≤ 2 hectares"],
        "applicationUrl": "https://pmkisan.gov.in",
        "category": "agriculture",
        "income_limit": None,
        "min_age": 18,
    },
    {
        "id": "nsp_scholarship",
        "name": "National Scholarship Portal",
        "description": "Scholarships for students from minority and SC/ST communities",
        "ministry": "Ministry of Education",
        "benefits": ["Tuition fee waiver", "Maintenance allowance", "Book grants"],
        "eligibility": ["Students in Class 1-PhD", "Annual income < ₹2.5 lakh", "SC/ST/OBC/Minority"],
        "applicationUrl": "https://scholarships.gov.in",
        "category": "education",
        "income_limit": 250000,
        "min_age": 5,
    },
    {
        "id": "ignoaps",
        "name": "Indira Gandhi National Old Age Pension",
        "description": "Monthly pension for senior citizens below poverty line",
        "ministry": "Ministry of Rural Development",
        "benefits": ["₹200-500/month pension", "Direct bank transfer"],
        "eligibility": ["Age ≥ 60 years", "BPL household"],
        "applicationUrl": "https://nsap.nic.in",
        "category": "pension",
        "income_limit": 200000,
        "min_age": 60,
    },
    {
        "id": "mudra_loan",
        "name": "PM Mudra Yojana",
        "description": "Loans up to ₹10 lakh for micro enterprises",
        "ministry": "Ministry of Finance",
        "benefits": ["Loans ₹50K to ₹10 lakh", "No collateral required", "Low interest rates"],
        "eligibility": ["Non-farm micro enterprises", "Age 18-65"],
        "applicationUrl": "https://mudra.org.in",
        "category": "finance",
        "income_limit": None,
        "min_age": 18,
    },
]


async def scheme_recommendation_agent(state: GraphState) -> GraphState:
    logger.info(f"[SchemeRecommendation] Processing application {state['application_id']}")

    user_data = state.get("user_data", {})
    income = float(user_data.get("annualIncome", 0) or 0)
    age = _get_age(user_data.get("dateOfBirth", ""))
    category = user_data.get("category", "general")

    recommendations = []
    for scheme in ALL_SCHEMES:
        score = 50.0
        income_limit = scheme.get("income_limit")
        min_age = scheme.get("min_age", 0)

        if income_limit and income > 0:
            if income <= income_limit:
                score += 30
            else:
                score -= 20

        if age and age >= min_age:
            score += 15

        if category in ["sc", "st", "obc"] and scheme["category"] in ["education", "housing"]:
            score += 10

        if score >= 50:
            recommendations.append({**scheme, "matchScore": min(round(score, 1), 99.0)})

    recommendations.sort(key=lambda x: x["matchScore"], reverse=True)
    top_recommendations = recommendations[:5]

    timeline_event = {
        "id": f"ts_{datetime.utcnow().timestamp()}",
        "stage": "Scheme Recommendations",
        "description": f"Found {len(top_recommendations)} matching welfare schemes for your profile.",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "Scheme Recommendation Agent",
    }

    return {
        **state,
        "current_stage": "workflow",
        "recommendations": top_recommendations,
        "timeline": [timeline_event],
    }


def _get_age(dob_str: str) -> int | None:
    if not dob_str:
        return None
    try:
        from datetime import date
        parts = dob_str.replace("-", "/").split("/")
        if len(parts) == 3:
            year = int(parts[0]) if len(parts[0]) == 4 else int(parts[2])
            return date.today().year - year
    except Exception:
        pass
    return None
