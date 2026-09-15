from typing import List, Dict, Optional
from langchain_core.documents import Document
from app.rag.vectorstore import PostgresVectorDB

class HybridRetriever:
    def __init__(self):
        self.db_manager = PostgresVectorDB()
        self.vectorstore = self.db_manager.get_vectorstore()
        
    def search_civic_guidelines(self, query: str, category_filter: Optional[str] = None, top_k: int = 3) -> List[Document]:
        search_type = "mmr"
        search_kwargs = {
            "k": top_k,
            "fetch_k": 10,
            "lambda_mult": 0.25 
        }
        
        if category_filter:
            search_kwargs["filter"] = {"source_file": category_filter}
            
        retriever = self.vectorstore.as_retriever(search_type=search_type, search_kwargs=search_kwargs)
        return retriever.invoke(query)

retriever_engine = HybridRetriever()
