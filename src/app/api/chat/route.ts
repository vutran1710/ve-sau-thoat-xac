import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { digitalPersonaPrompt } from "@/lib/persona";
import { NextRequest } from "next/server";
import { getUserToneProfile } from "@/lib/user-tone";

export async function POST(req: NextRequest) {
  const { messages, username } = await req.json();

  const toneInstruction = await getUserToneProfile(username);

  const result = streamText({
    model: openai("gpt-4o"),
    system: `${digitalPersonaPrompt}\n\n${toneInstruction}`,
    messages,
  });

  return result.toDataStreamResponse();
}
