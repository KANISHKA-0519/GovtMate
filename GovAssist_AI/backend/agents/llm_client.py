from groq import Groq
from config.settings import get_settings
import logging

logger = logging.getLogger(__name__)

_groq_client: Groq | None = None


def get_groq_client() -> Groq | None:
    global _groq_client
    if _groq_client is None:
        settings = get_settings()
        if settings.groq_api_key and settings.groq_api_key != "gsk_your_groq_api_key_here":
            try:
                _groq_client = Groq(api_key=settings.groq_api_key)
            except Exception as e:
                logger.warning(f"Groq client init failed: {e}")
    return _groq_client


async def call_llm(prompt: str, system: str = "", model: str = "llama-3.3-70b-versatile") -> str:
    client = get_groq_client()
    if not client:
        return _mock_llm_response(prompt)
    try:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=1024,
            temperature=0.3,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.warning(f"LLM call failed: {e}")
        return _mock_llm_response(prompt)


def _mock_llm_response(prompt: str) -> str:
    prompt_lower = prompt.lower()
    if "birth certificate" in prompt_lower:
        return "To apply for a Birth Certificate, you need: Aadhaar Card, Hospital discharge summary, Parent's ID proof. Visit your Municipal Corporation office or apply online through our platform."
    if "income" in prompt_lower:
        return "For an Income Certificate, you need: Aadhaar Card, PAN Card, Salary slips or bank statements. The Revenue Department processes this within 7-10 working days."
    if "eligib" in prompt_lower:
        return '{"isEligible": true, "score": 85, "reason": "Citizen meets all basic eligibility criteria", "criteria": []}'
    if "recommend" in prompt_lower:
        return "Based on your profile, you may be eligible for: PM Awas Yojana, Ayushman Bharat, National Scholarship Portal schemes."
    return "I can help you with government certificates and welfare schemes. Please describe what service you need, and I'll guide you through the process."
