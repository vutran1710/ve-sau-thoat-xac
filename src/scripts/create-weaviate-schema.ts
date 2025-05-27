import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import weaviate, { WeaviateClient } from "weaviate-ts-client";

export const createClient = () => {
  const client: WeaviateClient = weaviate.client({
    scheme: "https",
    host: process.env.WEAVIATE_HOST as string, // e.g., 'my-instance.weaviate.network'
    apiKey: process.env.WEAVIATE_API_KEY
      ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY)
      : undefined,
  });
  return client;
};

export async function ensureSchemaIfMissing() {
  const client = createClient();
  try {
    await client.schema.classGetter().withClassName("VuMessage").do();
    // Class exists — no action
  } catch (err: any) {
    // console.log("Error checking schema:", JSON.stringify(err));
    await client.schema
      .classCreator()
      .withClass({
        class: "VuMessage",
        vectorizer: "none",
        properties: [
          { name: "role", dataType: ["text"] },
          { name: "content", dataType: ["text"] },
        ],
      })
      .do();
  }
}

export async function createVuMemorySchema() {
  const client = createClient();

  await client.schema
    .classCreator()
    .withClass({
      class: "VuMemory",
      vectorizer: "none", // we embed manually
      properties: [
        { name: "content", dataType: ["text"] },
        { name: "source", dataType: ["text"] }, // e.g. 'friend', 'chatgpt'
        { name: "tags", dataType: ["text[]"] }, // optional: sarcasm, deep, funny
        { name: "timestamp", dataType: ["text"] }, // ISO string
      ],
    })
    .do();
}
