import weaviate, { type WeaviateClient } from "weaviate-ts-client";

export const client: WeaviateClient = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_HOST as string, // e.g., 'my-instance.weaviate.network'
  apiKey: process.env.WEAVIATE_API_KEY
    ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY)
    : undefined,
});
