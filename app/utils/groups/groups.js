import { NextResponse } from "next/server";
export async function GET() {
  //GET groupId
  const res = await fetch(`https://${process.env.CHAT_URL}/groups`, {
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  });
  const data = await res.json();
  const groups = data.groups;
  return NextResponse.json(groups[0].id);
}
