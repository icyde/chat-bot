import { NextResponse } from "next/server";
import EventSource from "eventsource";
export const dynamic = 'force-dynamic';

export async function POST(req,res) {
  // Webhook listener & SSE (untested)
  //output: messages
  const body = await req.json();
  const response = await request.json();
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache, no-transform',
    'Content-Type': 'text/event-stream',
  });
  res.write(
    `data: ${JSON.stringify(response)}`
  )
  res.on("close", () => {
    console.log("Connection closed");
    res.end();
  })
  res.socket?.on("close", ()=> {
    console.log("Connection closed");
    res.end();
  });
  // return Response.json({ res });
}


