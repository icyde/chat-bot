import { NextResponse } from "next/server";

export async function POST(req) {
  //POST new user
  //input: {}
  //output: userId
  const body = await req.json();
  const res = await fetch(`https://${process.env.CHAT_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/JSON",
      Authorization: `Bearer ${process.env.API_KEY}`,
      accept: "application/json",
    },
    body: JSON.stringify(body)
  });
  const data = await res.json()
  return NextResponse.json(data.id);
}