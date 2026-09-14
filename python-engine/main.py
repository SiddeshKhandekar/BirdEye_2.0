from fastapi import FastAPI, HTTPException
import uvicorn

app = FastAPI(
    title="BirdEye Orchestration AI",
    description="Python microservice for LangGraph & RAG powered civic orchestration",
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "BirdEye AI Engine"}

@app.post("/api/orchestration/route_civic_issue")
def route_civic_issue():
    # Placeholder for the LangGraph invocation
    return {
        "status": "pending",
        "message": "LangGraph state machine placeholder"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
