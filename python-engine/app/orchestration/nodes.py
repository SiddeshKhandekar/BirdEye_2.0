import json
from langchain_core.messages import SystemMessage, HumanMessage
from app.orchestration.state import OrchestrationState
from app.rag.retriever import retriever_engine
from app.core.llm import offline_llm
from app.schemas.domain import LangChainRoutingDecision

def retrieval_node(state: OrchestrationState) -> dict:
    """
    Node 1: Context Aggregator
    Takes the initial civic issue/security alert and queries the PGVector DB.
    """
    print(f"--- Node: Retrieval for ID {state['record_id']} ---")
    
    query = state.get("description", "")
    category = state.get("category", None)
    
    # Execute the MMR Hybrid Search we built in Phase 2
    docs = retriever_engine.search_civic_guidelines(query=query, category_filter=category)
    
    # LangGraph natively appends this to state['retrieved_docs'] due to Annotated[..., operator.add]
    return {"retrieved_docs": docs}

def decision_node(state: OrchestrationState) -> dict:
    """
    Node 2: Intelligent Routing Decision Maker
    Utilizes localized Llama-3 to calculate strict routing confidence & priority 
    based explicitly on the retrieved municipal SOP vectors.
    """
    print(f"--- Node: AI Decision Routing for ID {state['record_id']} ---")
    
    # Compile the retrieved documents into a text block for the LLM
    context_text = "\\n\\n".join([doc.page_content for doc in state.get("retrieved_docs", [])])
    
    # Leverage LangChain core messages for strict generation
    messages = [
        SystemMessage(content=f"You are a strict Civic AI Orchestrator running locally.\\n"
                              f"You must strictly adhere to the following Municipal Guidelines:\\n{context_text}\\n"
                              f"Output your decision explicitly matching this JSON schema: {LangChainRoutingDecision.schema_json()}"),
        HumanMessage(content=f"Issue Description: {state['description']}\\n"
                             f"Category: {state['category']}\\n"
                             f"Generate the exact routing decision.")
    ]
    
    # Pydantic-enforced generation using our Llama-3 connector configured with format="json" in Phase 1
    llm = offline_llm.llm.with_structured_output(LangChainRoutingDecision)
    
    try:
        decision_obj = llm.invoke(messages)
    except Exception as e:
        # Fallback pseudo-object on parse failure to prevent pipeline crash
        print(f"LLM Parse Error: {e}")
        return {
            "routing_confidence": 0.0,
            "human_review_required": True
        }
        
    # Determine Human-In-The-Loop Triggers based on arbitrary severity SLA
    needs_review = decision_obj.priority_assigned in ['high', 'critical'] or decision_obj.routing_confidence < 0.8
    
    return {
        "final_decision": decision_obj.model_dump(),
        "routing_confidence": decision_obj.routing_confidence,
        "priority_assigned": decision_obj.priority_assigned,
        "human_review_required": needs_review
    }
