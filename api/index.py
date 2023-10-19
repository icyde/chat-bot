from fastapi import FastAPI, HTTPException
from api.ai import generate_response
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    input: str

@app.get("/api/healthchecker")
def healthchecker():
    return {"status": "success", "message": "Integrate FastAPI Framework with Next.js"}

@app.post("/api/query")
async def generate(query: Query):
    global messages
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required!")
    
    # Generate a response for the user query
    # response = generate_response(query, messages)
    response = generate_response(query.input)
    
    return {
        "query": query,
        "response": response}
        # "latest_response": messages[-1].content,
        # "conversation_history": messages}