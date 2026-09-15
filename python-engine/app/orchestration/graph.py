from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from app.orchestration.state import OrchestrationState
from app.orchestration.nodes import retrieval_node, decision_node

def route_based_on_safety(state: OrchestrationState) -> str:
    """
    Conditional Edge Evaluator: 
    Examines the OrchestrationState after the LLM makes a decision.
    """
    if state.get("human_review_required", False):
        print(f"-> [ROUTER EDGE]: Escalating ID {state['record_id']} to HUMAN_REVIEW (Interrupt Triggered)")
        return "human_approval"
    
    print(f"-> [ROUTER EDGE]: Decision safe. Proceeding with fully automated dispatch.")
    return "auto_dispatch"

async def human_approval_queue(state: OrchestrationState) -> dict:
    # Optimization: Async node wrapper to pause state gracefully
    return {"final_decision": {"status": "AWAITING_HUMAN", "requires_override": True}}

async def dispatch_system(state: OrchestrationState) -> dict:
    # Optimization: Async node wrapper for standard API offloading
    return {"final_decision": {"status": "DISPATCHED", "requires_override": False}}

def build_orchestration_graph():
    """
    Compiles the Stateful LangGraph. 
    Defines the exact pathways the AI agent is allowed to trace.
    Optimized with memory-checkpointing to allow execution pausing.
    """
    workflow = StateGraph(OrchestrationState)
    
    # Add the autonomous engines
    workflow.add_node("retrieve_context", retrieval_node)
    workflow.add_node("evaluate_decision", decision_node)
    
    # Add the native async end-points
    workflow.add_node("human_approval_queue", human_approval_queue)
    workflow.add_node("dispatch_system", dispatch_system)
    
    # Define the sequential execution flow
    workflow.add_edge(START, "retrieve_context")
    workflow.add_edge("retrieve_context", "evaluate_decision")
    
    # Define the Dynamic Conditional Edge
    workflow.add_conditional_edges(
        "evaluate_decision",   
        route_based_on_safety, 
        {
            "human_approval": "human_approval_queue",
            "auto_dispatch": "dispatch_system"
        }
    )
    
    workflow.add_edge("human_approval_queue", END)
    workflow.add_edge("dispatch_system", END)
    
    # Optimization: Inject MemorySaver Checkpointing
    memory_checkpointer = MemorySaver()
    
    return workflow.compile(checkpointer=memory_checkpointer)

civic_orchestrator_app = build_orchestration_graph()
