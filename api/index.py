from __future__ import print_function
from functools import lru_cache
from fastapi import FastAPI, HTTPException, Request,Depends
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
class Message(BaseModel):
    content: str
    userId: str
    conversationId: str

@lru_cache()
def get_settings():
    return config.Settings()

@app.get("/api/healthchecker")
def healthchecker():
    return {"status": "success", "message": "Integrate FastAPI Framework with Next.js"}

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

@app.post('/api/createUser')
async def create_user(user: User, settings: Annotated[config.Settings, Depends(get_settings)]) -> AuthenticatedUser:
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
    userId = res.user.id
    return {"userId": userId, "email": user.email}

@app.post('/api/createConversation')
async def create_conversation(authenticatedUser: AuthenticatedUser, settings: Annotated[config.Settings, Depends(get_settings)]) -> str:
    r = await client.request(
        "POST",
        f"{settings.zendesk_host}/v2/apps/{settings.zendesk_app_id}/conversations",
        auth=(settings.zendesk_key_id, settings.zendesk_secret_key),
        json={
            'type': 'personal',
            'participants': [{
                "userId":authenticatedUser.userId,
                "subscribeSDKClient": False }],
            'description':' User is directed from the chatbot'
        }
        )
    res = r.json()
    conversationId = res.conversation.id
    return conversationId

@app.post('/api/sendMessage')
async def send_message( message: Message, settings: Annotated[config.Settings, Depends(get_settings)]):
    r = await client.request(
        "POST",
        f"{settings.zendesk_host}/v2/apps/{settings.zendesk_app_id}/conversations/{message.conversationId}/messages",
        auth=(settings.zendesk_key_id, settings.zendesk_secret_key),
        json={
            'author': {
                'type': 'user',
                'userId':message.userId,
            },
            'content': {
                'type': 'text',
                'text': message.content
            }
        }
        )
    res = r.json()
    return res

