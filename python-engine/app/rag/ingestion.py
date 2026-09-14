import os
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.llm import offline_llm

class VectorDBIngestor:
    def __init__(self, data_directory: str = "data/"):
        self.data_directory = data_directory
        # The embedding model config exists securely inside llm_connector.py
        self.embeddings = offline_llm.embeddings
        
    def load_and_chunk_documents(self):
        """
        Loads all raw markdown/text documents from the data directory
        and chunks them into manageable sequences for the Vector DB.
        """
        print(f"Loading documents from {self.data_directory}...")
        
        # Load all markdown files in the data directory
        loader = DirectoryLoader(
            self.data_directory, 
            glob="**/*.md", 
            loader_cls=TextLoader, 
            show_progress=True
        )
        documents = loader.load()
        
        print(f"Loaded {len(documents)} document(s).")
        
        # Initialize text splitter for 500 character chunks with 50 character overlap
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
            is_separator_regex=False,
        )
        
        chunked_docs = text_splitter.split_documents(documents)
        print(f"Split documents into {len(chunked_docs)} chunks.")
        
        return chunked_docs

    def ingest_to_pgvector(self, chunked_docs):
        """
        Placeholder implementation for saving chunks to Postgres/PGVector.
        This will be executed in Part 2 of Phase 2.
        """
        import json
        print(f"Prepared to ingest {len(chunked_docs)} chunks to Vector Database.")
        # E.g. PGVector.from_documents(chunked_docs, self.embeddings, connection_string=DB_URL)
        return True

if __name__ == "__main__":
    # Ensure correct working directory context
    if not os.path.exists("data"):
        print("Please run this script from the python-engine/ root directory.")
        exit(1)
        
    ingestor = VectorDBIngestor(data_directory="data/")
    chunks = ingestor.load_and_chunk_documents()
    ingestor.ingest_to_pgvector(chunks)
