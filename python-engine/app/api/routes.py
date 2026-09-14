from fastapi import APIRouter
from app.schemas.domain import LangChainRoutingDecision
from app.core.llm import offline_llm

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "BirdEye AI Engine"}

@router.post("/api/orchestration/route_civic_issue")
def route_civic_issue():
    # Placeholder for the LangGraph invocation
    return {
        "status": "pending",
        "message": "LangGraph state machine placeholder"
    }
