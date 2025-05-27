import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { retrieveRelevantHistory, storeMessage } from "@/lib/memory";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userMessage = messages.at(-1)?.content || "";

  const history = await retrieveRelevantHistory(userMessage);

  // Store user message before response
  await storeMessage("user", userMessage);

  return streamText({
    model: openai("gpt-4o"),
    system: `You are Vu. You speak as Vu, not as an assistant.`,
    messages: [...history, ...messages],
    async onFinish(completion) {
      await storeMessage("assistant", completion.text);
    },
  }).toDataStreamResponse();
}
