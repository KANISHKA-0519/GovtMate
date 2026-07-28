from typing import TypedDict, List, Dict, Any, Annotated
import operator


class GraphState(TypedDict):
    application_id: str
    user_id: str
    service_type: str
    service_name: str
    documents: List[Dict[str, Any]]
    user_data: Dict[str, Any]
    ocr_results: Dict[str, Any]
    form_data: Dict[str, Any]
    verification_result: Dict[str, Any]
    eligibility_result: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    workflow_result: Dict[str, Any]
    notifications: Annotated[List[Dict[str, Any]], operator.add]
    timeline: Annotated[List[Dict[str, Any]], operator.add]
    current_stage: str
    errors: Annotated[List[str], operator.add]
    messages: Annotated[List[Dict[str, Any]], operator.add]
