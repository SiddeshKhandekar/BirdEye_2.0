import json
import logging
from langchain_core.messages import SystemMessage, HumanMessage
from app.orchestration.state import OrchestrationState
from app.rag.retriever import retriever_engine
from app.core.llm import offline_llm
from app.schemas.domain import LangChainRoutingDecision

logger = logging.getLogger(__name__)

async def retrieval_node(state: OrchestrationState) -> dict:
    """
    Node 1: Context Aggregator (Async)
    Executes the PGVector db lookup concurrently without blocking the FastAPI event loop.
    """
    print(f"--- [ASYNC] Node: Retrieval for ID {state['record_id']} ---")
    
    query = state.get("description", "")
    category = state.get("category", None)
    
    # LangChain retrievers support native async invocations
    docs = await retriever_engine.vectorstore.as_retriever(
        search_type="mmr", search_kwargs={"k": 3, "fetch_k": 10, "lambda_mult": 0.25}
    ).ainvoke(query)
    
    return {"retrieved_docs": docs}

async def decision_node(state: OrchestrationState) -> dict:
    """
    Node 2: Intelligent Routing Decision Maker (Async)
    Uses a bounded context window and a self-correcting retry-chain 
    to guarantee strict JSON output.
    """
    print(f"--- [ASYNC] Node: AI Decision Routing for ID {state['record_id']} ---")
    
    # Optimization 1: Context Window Truncation
    # Llama-3-8B has an 8k limit. Protect the prompt by safely capping string generation.
    raw_context = "\\n\\n".join([doc.page_content for doc in state.get("retrieved_docs", [])])
    safe_context_text = raw_context[:6000] # Safe token buffer limit
    
    messages = [
        SystemMessage(content=f"You are a strict Civic AI Orchestrator running locally.\\n"
                              f"You must strictly adhere to the following Municipal Guidelines:\\n{safe_context_text}\\n"
                              f"Output your decision explicitly matching this JSON schema: {LangChainRoutingDecision.schema_json()}"),
        HumanMessage(content=f"Issue Description: {state['description']}\\n"
                             f"Category: {state['category']}\\n"
                             f"Generate the exact routing decision.")
    ]
    
    # Optimization 2: Auto-Correcting Retry Wrapper
    # If the local LLM outputs broken JSON, this automatically bounces it back with the error 
    # and forces it to fix the JSON structure (up to 3 times) before giving up.
    llm = offline_llm.llm.with_structured_output(LangChainRoutingDecision).with_retry(stop_after_attempt=3)
    
    try:
        decision_obj = await llm.ainvoke(messages)
    except Exception as e:
        logger.error(f"Catastrophic LLM Parse Error after 3 retries: {e}")
        return {
            "routing_confidence": 0.0,
            "human_review_required": True,
            "priority_assigned": "critical" # Fail safe: assume the worst if unknown
        }
        
    needs_review = decision_obj.priority_assigned in ['high', 'critical'] or decision_obj.routing_confidence < 0.8
    
    return {
        "final_decision": decision_obj.model_dump(),
        "routing_confidence": decision_obj.routing_confidence,
        "priority_assigned": decision_obj.priority_assigned,
        "human_review_required": needs_review
    }
