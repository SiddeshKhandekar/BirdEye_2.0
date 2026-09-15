import operator
from typing import TypedDict, Annotated, List, Optional
from langchain_core.documents import Document

class OrchestrationState(TypedDict):
    """
    The strict persistent state map that gets passed sequentially 
    or recursively between every node in the LangGraph Orchestrator.
    """
    # Core Issue Trackers
    record_id: str
    record_type: str                   # 'civic_issue' or 'security_alert'
    description: str                   
    category: Optional[str]            # E.g., 'pothole', 'garbage', 'water'
    
    # RAG Context
    # 'Annotated[list, operator.add]' tells LangGraph to *append* items to this list when a node returns it
    retrieved_docs: Annotated[List[Document], operator.add]
    
    # AI Logic Constraints
    routing_confidence: float          # 0.0 to 1.0 confidence score produced by LLM
    priority_assigned: Optional[str]   # 'low', 'medium', 'high', 'critical'
    
    # Human-In-The-Loop Execution
    human_review_required: bool        # Flag triggering manual web-app interrupts
    
    # Final Action Artifact
    final_decision: Optional[dict]     # Resolves strictly to LangChainRoutingDecision schema
