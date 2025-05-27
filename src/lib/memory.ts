import { client } from "./weaviate";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedText(text: string): Promise<number[]> {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return embedding.data[0].embedding;
}

export async function storeMessage(role: string, content: string) {
  const vector = await embedText(content);
  await client.data
    .creator()
    .withClassName("VuMessage")
    .withProperties({ role, content })
    .withVector(vector)
    .do();
}

export async function retrieveRelevantHistory(input: string, k = 3) {
  const vector = await embedText(input);

  const result = await client.graphql
    .get()
    .withClassName("VuMessage")
    .withFields("content role")
    .withNearVector({ vector })
    .withWhere({
      path: ["role"],
      operator: "Equal",
      valueText: "assistant",
    })
    .withLimit(k)
    .do();

  return result.data.Get.VuMessage.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  }));
}
