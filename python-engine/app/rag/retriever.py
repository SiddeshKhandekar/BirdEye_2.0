from typing import List, Dict, Optional
from langchain_core.documents import Document
from app.rag.vectorstore import PostgresVectorDB

class HybridRetriever:
    """
    Handles retrieval of civic guidelines by executing hybrid-style lookups 
    (Dense vector clustering + Hard JSONB Metadata filtering).
    """
    def __init__(self):
        # Establish the pooled connection to the PGVector DB
        self.db_manager = PostgresVectorDB()
        self.vectorstore = self.db_manager.get_vectorstore()
        
    def search_civic_guidelines(self, query: str, category_filter: Optional[str] = None, top_k: int = 3) -> List[Document]:
        """
        Retrieves municipal SOP guidelines using Maximal Marginal Relevance (MMR) 
        combining semantic vector similarity with JSONB category filters.
        """
        # Optimization 1: Use MMR to ensure fetched chunks are relevant but diverse
        search_type = "mmr"
        
        # Optimization 2: Fetch 10 candidates from DB, but only return the top_k most diverse ones
        search_kwargs = {
            "k": top_k,
            "fetch_k": 10,
            "lambda_mult": 0.25 # Favor diversity over raw similarity to prevent duplicate contexts
        }
        
        if category_filter:
            search_kwargs["filter"] = {"source_file": category_filter}
            
        print(f"Executing MMR Hybrid Search | Query: '{query}' | Filter: {category_filter}")
        
        retriever = self.vectorstore.as_retriever(search_type=search_type, search_kwargs=search_kwargs)
        
        return retriever.invoke(query)

# Singleton export for the LangGraph orchestration nodes
retriever_engine = HybridRetriever()

if __name__ == "__main__":
    # Test script for hybrid retrieval execution
    engine = HybridRetriever()
    
    # 1. Unfiltered dense retrieval 
    print("\\n--- Unfiltered Semantic Retrieval ---")
    results = engine.search_civic_guidelines("A pipe on the main road burst and is flooding the tarmac.")
    for res in results:
        print(f"Match: {res.page_content[:50]}...")
