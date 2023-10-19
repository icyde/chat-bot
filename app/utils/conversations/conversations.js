import { NextResponse } from "next/server";

export async function POST(req) {
  //Create new conversation
  //params: message, channelId, groupId, userId
  //output: conversationId
  const body = await req.json();
  console.log(body)
  const message = {
    "users":[{ 
      "id": body.userId
    }],
    "status": "new",
    "messages": [
      {
        "message_parts": [{
        "text": {
          "content": body.message
          }
        }],
        "channel_id": body.channelId,
        "message_type": "normal",
        "actor_type": "user",
        "actor_id":body.userId
        }
      ],
      "channel_id":body.channelId,
      "assigned_group_id":body.groupId
  }
  const res = await fetch(`https://${process.env.CHAT_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/JSON",
      Authorization: `Bearer ${process.env.API_KEY}`,
      accept: "application/json",
    },
    body: JSON.stringify(message),
  });
  const data = await res.json();
  return NextResponse.json(data.conversation_id);
}
