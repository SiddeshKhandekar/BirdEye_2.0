import os
from langchain_community.vectorstores import PGVector
from app.core.llm import offline_llm

class PostgresVectorDB:
    def __init__(self, connection_string: str = None):
        # Default fallback string if no `.env` is loaded
        self.connection_string = connection_string or os.getenv(
            "PGVECTOR_CONNECTION_STRING", 
            "postgresql+psycopg2://postgres:password@localhost:5432/birdeye"
        )
        self.collection_name = "municipal_sops"
        self.embeddings = offline_llm.embeddings
        
    def get_vectorstore(self) -> PGVector:
        """
        Initializes and returns the LangChain PGVector wrapper instance.
        Optimized with SQLAlchemy connection pooling to prevent connection drops.
        """
        return PGVector(
            connection_string=self.connection_string,
            embedding_function=self.embeddings,
            collection_name=self.collection_name,
            pre_delete_collection=False,
            use_jsonb=True, # Optimization: Use Postgres JSONB for fast metadata lookups
            engine_args={
                "pool_size": 10,       # Optimization: Keep 10 connections warm
                "max_overflow": 20     # Allow up to 20 bursts
            }
        )
        
    def add_documents_to_store(self, chunked_documents):
        """
        Ingests processed document chunks directly into the PostgreSQL Database.
        """
        print(f"Connecting to PGVector at {self.connection_string}...")
        
        # PGVector automatically creates the pgvector extension and tables if they don't exist
        db = PGVector.from_documents(
            documents=chunked_documents,
            embedding=self.embeddings,
            collection_name=self.collection_name,
            connection_string=self.connection_string,
            pre_delete_collection=True,  # Clear old data before ingestion for idempotency
            use_jsonb=True,              # Ensure JSONB metadata indexing
            engine_args={"pool_size": 10, "max_overflow": 20}
        )
        
        # Note for HNSW Indexing: PGVector dynamically builds HNSW inside Postgres when executing searches.
        # To strictly enforce the HNSW build on large datasets natively via SQL:
        # db.execute("CREATE INDEX ON langchain_pg_embedding USING hnsw (embedding vector_cosine_ops);")
        
        print(f"Successfully ingested {len(chunked_documents)} chunks into PGVector table '{self.collection_name}'.")
        return db
