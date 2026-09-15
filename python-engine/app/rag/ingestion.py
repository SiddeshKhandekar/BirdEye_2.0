import os
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter
from app.core.llm import offline_llm

class VectorDBIngestor:
    def __init__(self, data_directory: str = "data/"):
        self.data_directory = data_directory
        self.embeddings = offline_llm.embeddings
        
    def load_and_chunk_documents(self):
        """
        Loads all raw markdown documents using multithreading, and applies 
        Semantic Markdown Splitting to preserve heading metadata.
        """
        print(f"Loading documents from {self.data_directory}...")
        
        # 1. Optimize: Added multithreading to speed up large municipal datasets
        loader = DirectoryLoader(
            self.data_directory, 
            glob="**/*.md", 
            loader_cls=TextLoader, 
            show_progress=True,
            use_multithreading=True
        )
        documents = loader.load()
        
        print(f"Loaded {len(documents)} document(s).")
        
        # 2. Optimize: Semantic Splitter captures headers (#, ##, ###) and tags them into metadata
        # This massively improves RAG by making chunks aware of their parent context.
        headers_to_split_on = [
            ("#", "Header 1"),
            ("##", "Role Specification"),
            ("###", "Severity Threshold"),
        ]
        markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
        
        # 3. Optimize: Fallback character splitter for any violently long paragraphs
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len
        )
        
        all_semantic_chunks = []
        for doc in documents:
            # First split by semantic headers
            md_header_splits = markdown_splitter.split_text(doc.page_content)
            # Then recursively chunk anything remaining that is still too large
            text_splits = text_splitter.split_documents(md_header_splits)
            
            # 4. Optimize: Inject file lineage into metadata explicitly
            for split in text_splits:
                split.metadata["source_file"] = doc.metadata.get("source", "unknown_source")
            
            all_semantic_chunks.extend(text_splits)
            
        print(f"Semantically split documents into {len(all_semantic_chunks)} context-aware chunks.")
        
        return all_semantic_chunks

    def ingest_to_pgvector(self, chunked_docs):
        """
        Saves chunks securely and locally into the PGVector Postgres database.
        """
        from app.rag.vectorstore import PostgresVectorDB
        print(f"Prepared to ingest {len(chunked_docs)} semantic chunks to Vector Database.")
        
        db = PostgresVectorDB()
        db.add_documents_to_store(chunked_docs)
        
        return True

if __name__ == "__main__":
    # Ensure correct working directory context
    if not os.path.exists("data"):
        print("Please run this script from the python-engine/ root directory.")
        exit(1)
        
    ingestor = VectorDBIngestor(data_directory="data/")
    chunks = ingestor.load_and_chunk_documents()
    ingestor.ingest_to_pgvector(chunks)
