from langgraph.graph import StateGraph, START, END
from app.orchestration.state import OrchestrationState
from app.orchestration.nodes import retrieval_node, decision_node

def route_based_on_safety(state: OrchestrationState) -> str:
    """
    Conditional Edge Evaluator: 
    Examines the OrchestrationState after the LLM makes a decision.
    If the LLM flags 'human_review_required', this explicitly breaks the automation 
    and sends the issue to a manual review queue instead of instantly dispatching it.
    """
    if state.get("human_review_required", False):
        print(f"-> [ROUTER EDGE]: Escalating ID {state['record_id']} to HUMAN_REVIEW (Interrupt Triggered)")
        return "human_approval"
    
    print(f"-> [ROUTER EDGE]: Decision safe. Proceeding with fully automated dispatch.")
    return "auto_dispatch"

def build_orchestration_graph():
    """
    Compiles the Stateful LangGraph. 
    Defines the exact pathways the AI agent is allowed to trace.
    """
    # 1. Initialize the graph using our strict memory TypedDict
    workflow = StateGraph(OrchestrationState)
    
    # 2. Add the autonomous engines
    workflow.add_node("retrieve_context", retrieval_node)
    workflow.add_node("evaluate_decision", decision_node)
    
    # Optional pseudo-nodes for endpoints
    workflow.add_node("human_approval_queue", lambda state: {"final_decision": {"status": "AWAITING_HUMAN"}})
    workflow.add_node("dispatch_system", lambda state: {"final_decision": {"status": "DISPATCHED"}})
    
    # 3. Define the sequential execution flow
    # Start -> Retrieve Context -> Evaluate Decision
    workflow.add_edge(START, "retrieve_context")
    workflow.add_edge("retrieve_context", "evaluate_decision")
    
    # 4. Define the Dynamic Conditional Edge (The "Intelligence" of the Graph)
    workflow.add_conditional_edges(
        "evaluate_decision",   # The node deciding where to go
        route_based_on_safety, # The python logic router function doing the calculation
        {
            "human_approval": "human_approval_queue",
            "auto_dispatch": "dispatch_system"
        }
    )
    
    # End pipes
    workflow.add_edge("human_approval_queue", END)
    workflow.add_edge("dispatch_system", END)
    
    # Compile the graph into a runnable executable API
    return workflow.compile()

# Export a singleton compiled instance to be mapped securely to the FastAPI endpoints
civic_orchestrator_app = build_orchestration_graph()
