// scripts/import-memory.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import weaviate from "weaviate-ts-client";
import OpenAI from "openai";

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

async function ensureVuMemorySchema() {
  try {
    await client.schema.classGetter().withClassName("VuMemory").do();
    console.log("ℹ️  VuMemory schema already exists");
  } catch (err: unknown) {
    console.error(
      "⚠️ VuMemory schema not found, creating it...",
      JSON.stringify(err),
    );
    await client.schema
      .classCreator()
      .withClass({
        class: "VuMemory",
        vectorizer: "none",
        properties: [
          { name: "content", dataType: ["text"] },
          { name: "source", dataType: ["text"] },
          { name: "tags", dataType: ["text[]"] },
          { name: "timestamp", dataType: ["text"] },
        ],
      })
      .do();
  }
}

async function importMemory() {
  await ensureVuMemorySchema();

  const filePath = path.resolve("data/past_messages.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const messages = JSON.parse(raw);

  for (const msg of messages) {
    const vector = await embed(msg.content);

    await client.data
      .creator()
      .withClassName("VuMemory")
      .withProperties({
        content: msg.content,
        source: msg.source,
        tags: msg.tags,
        timestamp: msg.timestamp,
      })
      .withVector(vector)
      .do();

    console.log(`✅ Imported: ${msg.content.slice(0, 60)}...`);
  }

  console.log("🎉 Finished importing memory.");
}

importMemory();
