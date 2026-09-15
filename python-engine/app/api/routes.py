from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.domain import CivicIssue, SecurityEvent, LangChainRoutingDecision
from app.orchestration.graph import civic_orchestrator_app
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/v2/ai", tags=["Orchestration Engine"])

class HumanOverridePayload(BaseModel):
    manager_signature: str
    approved: bool
    override_priority: str = None
    override_department: str = None

@router.post("/orchestrate", response_model=LangChainRoutingDecision)
async def process_orchestration(payload: CivicIssue | SecurityEvent):
    """
    Main entrypoint for the BirdEye Frontend.
    Takes standard JSON payloads, constructs the Graph State, 
    and fires it directly into the LangGraph asynchronous router.
    """
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
    
    # LangGraph MemorySaver binding
    config = {"configurable": {"thread_id": f"thread_{payload.record_id}"}}
    
    try:
        print(f"\n[FASTAPI] --> Passing ID {payload.record_id} to LangGraph State Machine...")
        final_state = await civic_orchestrator_app.ainvoke(initial_state, config=config)
        
        # Optimization: Safely parse potential Human-In-The-Loop truncated states
        decision_data = final_state.get("final_decision")
        
        if not decision_data:
            raise ValueError("LangGraph execution completed but produced no decision artifact.")
            
        # If the graph was paused by the MemorySaver inside the human_approval_queue node, 
        # it returned a truncated status flag. We must manually expand it to satisfy 
        # the strict FastAPI LangChainRoutingDecision return schema to avoid a 500 crash.
        if decision_data.get("status") == "AWAITING_HUMAN":
            print(f"[FASTAPI] <-- GRAPH PAUSED: Escrowing ID {payload.record_id} for frontend Human signature.")
            return LangChainRoutingDecision(
                record_id=payload.record_id,
                record_type=payload.record_type,
                assigned_department="REVIEW_ESCALATION",
                routing_confidence=final_state.get("routing_confidence", 0.0),
                priority_assigned=final_state.get("priority_assigned", "critical"),
                rationale="System explicitly halted automated dispatch. Human signature definitively required.",
                action_plan=["AWAIT_HUMAN_APPROVAL"],
                human_review_required=True
            )
            
        print(f"[FASTAPI] <-- LangGraph returned completed ticket for ID {payload.record_id}")
        return LangChainRoutingDecision(**decision_data)
        
    except Exception as e:
        print(f"Orchestration Route Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resume/{record_id}", response_model=LangChainRoutingDecision)
async def resume_paused_graph(record_id: str, payload: HumanOverridePayload):
    """
    HITL Endpoint (Human In The Loop).
    Allows a human manager to manually approve or override a paused Graph execution 
    by targeting its physical memory thread_id safely.
    """
    config = {"configurable": {"thread_id": f"thread_{record_id}"}}
    
    try:
        # Fetch the current paused memory footprint
        graph_state = await civic_orchestrator_app.aget_state(config)
        
        if not graph_state or not graph_state.values:
            raise HTTPException(status_code=404, detail="No active or paused thread found for this record_id.")
            
        print(f"\n[FASTAPI] --> Human Signature Received for ID {record_id} by {payload.manager_signature}. Unlocking thread...")
        
        # We manually inject the human's overrides (e.g. stripping the review blocker)
        # to guarantee the StateGraph successfully transitions off the paused edge.
        state_updates = {
            "human_review_required": False
        }
        if payload.override_priority:
            state_updates["priority_assigned"] = payload.override_priority
            
        # Natively update the suspended variables securely within LangGraph MemorySaver
        await civic_orchestrator_app.aupdate_state(config, state_updates)
        
        # Passing None to ainvoke natively instructs a paused graph to resume execution from the EXACT node it halted at!
        final_state = await civic_orchestrator_app.ainvoke(None, config=config)
        
        decision_data = final_state.get("final_decision", {})
        
        # Because we forced 'human_review_required=False', the graph resolves completely normally 
        # as if the human had been the LLM all along.
        print(f"[FASTAPI] <-- LangGraph successfully completed Human Override for ID {record_id}")
        return LangChainRoutingDecision(**decision_data)
        
    except Exception as e:
        print(f"Resume Route Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
