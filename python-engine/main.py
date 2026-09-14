import uvicorn
from fastapi import FastAPI
from app.api.routes import router as api_router

app = FastAPI(
    title="BirdEye Orchestration AI",
    description="Python microservice for LangGraph & RAG powered civic orchestration",
    version="1.0.0"
)

app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
