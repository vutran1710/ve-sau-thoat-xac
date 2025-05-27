import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { conversationId, role, content } = await req.json();

  await sql`
    INSERT INTO messages (id, conversation_id, role, content)
    VALUES (${randomUUID()}, ${conversationId}, ${role}, ${content});
  `;

  return NextResponse.json({ ok: true });
}
