from fastapi import APIRouter, HTTPException
from typing import Dict
from app.schemas.domain import CivicIssue, SecurityEvent, LangChainRoutingDecision
from app.core.llm import offline_llm
from app.orchestration.graph import civic_orchestrator_app

router = APIRouter(prefix="/v2/ai", tags=["Orchestration Engine"])

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "BirdEye AI Engine"}

@router.post("/orchestrate", response_model=LangChainRoutingDecision)
async def process_orchestration(payload: CivicIssue | SecurityEvent):
    """
    Main entrypoint for the BirdEye Frontend.
    Takes standard JSON payloads, constructs the Graph State, 
    and fires it directly into the LangGraph asynchronous router.
    """
    # 1. Initialize the pristine LangGraph context window based on our TypedDict
    initial_state = {
        "record_id": payload.record_id,
        "record_type": payload.record_type,
        "description": payload.description,
        "category": payload.category if hasattr(payload, 'category') else "security_alert",
        "retrieved_docs": [],
        "routing_confidence": 0.0,
        "priority_assigned": None,
        "human_review_required": False,
        "final_decision": None
    }
    
    # 2. To utilize LangGraph's MemorySaver, we must provide a unique thread_id 
    config = {"configurable": {"thread_id": f"thread_{payload.record_id}"}}
    
    try:
        # 3. Fire the autonomous engine (Async)
        print(f"\n[FASTAPI] --> Passing ID {payload.record_id} to LangGraph State Machine...")
        final_state = await civic_orchestrator_app.ainvoke(initial_state, config=config)
        
        # 4. Extract and resolve the resulting LLM mapping block
        decision_data = final_state.get("final_decision")
        if not decision_data:
            raise ValueError("LangGraph completed execution but returned no final_decision.")
            
        print(f"[FASTAPI] <-- LangGraph returned completed ticket for ID {payload.record_id}")
        return LangChainRoutingDecision(**decision_data)
        
    except Exception as e:
        print(f"Orchestration Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
