// scripts/query-memory.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import weaviate from "weaviate-ts-client";
import OpenAI from "openai";
import readline from "readline";

const client = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_HOST!,
  apiKey: process.env.WEAVIATE_API_KEY
    ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY)
    : undefined,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

async function queryMemory(prompt: string) {
  const vector = await embed(prompt);

  const result = await client.graphql
    .get()
    .withClassName("VuMemory")
    .withFields("content source tags timestamp")
    .withNearVector({ vector })
    .withWhere({
      path: ["source"],
      operator: "Equal",
      valueText: "friend",
    })
    .withLimit(5)
    .do();

  const matches = result.data.Get.VuMemory;

  if (!matches || matches.length === 0) {
    console.log("⚠️ No relevant memory found.");
  } else {
    console.log("\n🧠 Top Matches:");
    matches.forEach(
      (
        m: {
          content: string;
          source: string;
          tags: string[];
          timestamp: number;
        },
        i: number,
      ) => {
        console.log(`\n#${i + 1}`);
        console.log(`- content: ${m.content}`);
        console.log(`- source: ${m.source}`);
        console.log(`- tags: ${m.tags?.join(", ")}`);
        console.log(`- timestamp: ${m.timestamp}`);
      },
    );
  }
}

// Interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("🔍 Enter a prompt to query VuMemory: ", async (prompt) => {
  await queryMemory(prompt);
  rl.close();
});
