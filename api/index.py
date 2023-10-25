from __future__ import print_function
from functools import lru_cache
from fastapi import FastAPI, HTTPException, Request,Depends, WebSocket,WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from typing import Optional
from typing_extensions import Annotated
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
import os
import pprint
from pydantic_settings import BaseSettings, SettingsConfigDict
from . import config

load_dotenv()
app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")
client = httpx.AsyncClient()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    input: str

class User(BaseModel):
    email: str

class AuthenticatedUser(BaseModel):
    userId: str
    email:str
class SendMessage(BaseModel):
    content: str
    userId: str
    conversationId: str

class ReceiveMessage(BaseModel):
    content:str
    messageId: str
    userId: str
    conversationId: str

class InitConversation(BaseModel):
    email: str
    content: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[(WebSocket, str)] = []

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections.append((websocket,client_id))

    def disconnect(self, websocket: WebSocket, client_id: str):
        self.active_connections.remove((websocket, client_id))

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()


@lru_cache()
def get_settings():
    return config.Settings()

@app.get("/api/healthchecker")
def healthchecker():
    return {"status": "success", "message": "Integrate FastAPI Framework with Next.js"}

#TODO: CHANGE NGROX URL EVERY 2 HOURS!
@app.post('/api/hook')
async def incomingMessage(req: Request):
    body = await req.json()
    conversationId = body['events'][0]['payload']['conversation']['id']
    senderType = body['events'][0]['payload']['message']['author']['type']
    senderName = body['events'][0]['payload']['message']['author']['displayName']
    contentType = body['events'][0]['payload']['message']['content']['type']
    content = body['events'][0]['payload']['message']['content']['text']
    res = {'conversationId': conversationId, 'senderType': senderType, 'senderName': senderName, 'contentType': contentType, 'content': content}
    for socket in manager.active_connections:
        if socket[1] == conversationId:
            await manager.send_personal_message(jsonable_encoder(res), socket[0])

    print(conversationId, senderType, senderName, contentType, content)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")

@app.post('/api/createUser')
async def create_user(user: User, settings: Annotated[config.Settings, Depends(get_settings)]) -> AuthenticatedUser:
    #TODO: CHECK IF USER EXISTS
    r = await client.request(
        "POST",
        f"{settings.zendesk_host}/v2/apps/{settings.zendesk_app_id}/users",
        auth=(settings.zendesk_key_id, settings.zendesk_secret_key),
        json={'externalId': user.email,
              'profile':{
                  'email': user.email,
              }},
    )
    res = r.json()
    userId = res['user']['id']
    return {"userId": userId, "email": user.email}

@app.post('/api/createConversation')
async def create_conversation(authenticatedUser: AuthenticatedUser, settings: Annotated[config.Settings, Depends(get_settings)]) -> str:
    #TODO: CHECK IF CONVERSATION ALREADY EXISTS
    r = await client.request(
        "POST",
        f"{settings.zendesk_host}/v2/apps/{settings.zendesk_app_id}/conversations",
        auth=(settings.zendesk_key_id, settings.zendesk_secret_key),
        json={
            'type': 'personal',
            'participants': [{
                "userId":authenticatedUser['userId'],
                "subscribeSDKClient": False }],
            'description':' User is directed from the chatbot'
        }
        )
    res = r.json()
    conversationId = res['conversation']['id']
    return conversationId

@app.post('/api/sendMessage')
async def send_message( message: SendMessage, settings: Annotated[config.Settings, Depends(get_settings)]):
    if type(message) is not dict:
        message= message.dict()
    r = await client.request(
        "POST",
        f"{settings.zendesk_host}/v2/apps/{settings.zendesk_app_id}/conversations/{message['conversationId']}/messages",
        auth=(settings.zendesk_key_id, settings.zendesk_secret_key),
        json={
            'author': {
                'type': 'user',
                'userId':message['userId'],
            },
            'content': {
                'type': 'text',
                'text': message['content']
            }
        }
        )
    res = r.json()
    return { 'messageId': res['messages'][0]['id'], 'content': message['content'], 'userId': message['userId'], 'conversationId': message['conversationId']}

@app.post('/api/initConversation')
async def init_conversation(init: InitConversation, settings: Annotated[config.Settings, Depends(get_settings)]):
    authenticatedUser: AuthenticatedUser = await create_user((User(email=init.email)), settings)
    conversationId: str = await create_conversation(authenticatedUser, settings)
    sendMessage: SendMessage = {'content': init.content, 'userId': authenticatedUser['userId'], 'conversationId': conversationId}
    receiveMessage: ReceiveMessage = await send_message(sendMessage, settings)
    return receiveMessage


    

