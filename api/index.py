from fastapi import FastAPI, HTTPException, Request
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
    print("I'm working")
    
    return {
        "query": query,
        "response": response}
        # "latest_response": messages[-1].content,
        # "conversation_history": messages}


#TODO: CHANGE NGROX URL EVERY 2 HOURS!
@app.post('/hook')
async def incomingMessage(req: Request):
    body = await req.json()
    conversationId = body['events'][0]['payload']['conversation']['id']
    senderType = body['events'][0]['payload']['message']['author']['type']
    senderName = body['events'][0]['payload']['message']['author']['displayName']
    contentType = body['events'][0]['payload']['message']['content']['type']
    content = body['events'][0]['payload']['message']['content']['text']

    print(conversationId, senderType, senderName, contentType, content)
