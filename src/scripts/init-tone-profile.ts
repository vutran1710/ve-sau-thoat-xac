// scripts/init-tone-profile.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import weaviate from "weaviate-ts-client";

const client = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_HOST!,
  apiKey: process.env.WEAVIATE_API_KEY
    ? new weaviate.ApiKey(process.env.WEAVIATE_API_KEY)
    : undefined,
});

async function ensureToneSchema() {
  try {
    await client.schema.classGetter().withClassName("VuToneProfile").do();
    console.log("ℹ️  VuToneProfile schema already exists.");
  } catch (err: any) {
    await client.schema
      .classCreator()
      .withClass({
        class: "VuToneProfile",
        vectorizer: "none",
        properties: [
          { name: "username", dataType: ["text"] },
          { name: "tone", dataType: ["text"] },
        ],
      })
      .do();
    console.log("✅ VuToneProfile schema created.");
  }
}

const entries = [
  { username: "linh", tone: "roast" },
  { username: "thảo", tone: "tease" },
  { username: "thêu", tone: "tease" },
  { username: "khoai", tone: "formal" },
];

async function insertToneProfiles() {
  for (const entry of entries) {
    await client.data
      .creator()
      .withClassName("VuToneProfile")
      .withProperties(entry)
      .do();
    console.log(`✅ Inserted ${entry.username} with tone ${entry.tone}`);
  }
}

async function main() {
  await ensureToneSchema();
  await insertToneProfiles();
  console.log("🎉 Tone profile initialization complete.");
}

main().catch(console.error);
