import { NextResponse } from "next/server";
export async function GET() {
  //Get channelId
  //output: channelId
  const res = await fetch(`https://${process.env.CHAT_URL}/channels`, {
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  });
  const data = await res.json();
  const channels = data.channels
  return NextResponse.json(channels[0].id);
}
