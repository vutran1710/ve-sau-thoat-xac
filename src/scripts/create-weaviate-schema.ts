import dotenv from "dotenv";
import weaviate, { WeaviateClient } from "weaviate-ts-client";

async function ensureSchemaIfMissing() {
  dotenv.config({ path: ".env.local" });
  console.log("HOST", process.env.WEAVIATE_HOST);
  const client: WeaviateClient = weaviate.client({
    scheme: "https",
    host: process.env.WEAVIATE_HOST as string, // e.g., 'my-instance.weaviate.network'
    apiKey: process.env.WEAVIATE_API_KEY
      ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY)
      : undefined,
  });
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

ensureSchemaIfMissing();
