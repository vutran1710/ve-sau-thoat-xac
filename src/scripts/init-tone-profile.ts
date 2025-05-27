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
  } catch (err: unknown) {
    console.error(
      "⚠️ VuToneProfile schema not found, creating it...",
      JSON.stringify(err),
    );
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
  { username: "thảo", tone: "roast" },
  { username: "thêu", tone: "roast" },
];

async function upsertToneProfile(entry: { username: string; tone: string }) {
  try {
    const result = await client.graphql
      .get()
      .withClassName("VuToneProfile")
      .withFields("_additional { id }")
      .withWhere({
        path: ["username"],
        operator: "Equal",
        valueText: entry.username,
      })
      .withLimit(1)
      .do();

    const existing = result.data?.Get?.VuToneProfile?.[0];

    if (existing) {
      await client.data
        .updater()
        .withClassName("VuToneProfile")
        .withId(existing._additional.id)
        .withProperties(entry)
        .do();
      console.log(`🔁 Updated ${entry.username} with tone ${entry.tone}`);
    } else {
      await client.data
        .creator()
        .withClassName("VuToneProfile")
        .withProperties(entry)
        .do();
      console.log(`✅ Inserted ${entry.username} with tone ${entry.tone}`);
    }
  } catch (err) {
    console.error(`❌ Failed upserting ${entry.username}:`, err);
  }
}

async function insertToneProfiles() {
  for (const entry of entries) {
    await upsertToneProfile(entry);
  }
}

async function main() {
  await ensureToneSchema();
  await insertToneProfiles();
  console.log("🎉 Tone profile initialization complete.");
}

main().catch(console.error);
