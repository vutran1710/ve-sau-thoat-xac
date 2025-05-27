import { client } from "./weaviate";

export async function ensureSchemaIfMissing() {
  try {
    await client.schema.classGetter().withClassName("VuMessage").do();
    // Class exists — no action
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // Class doesn't exist — create it
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
    } else {
      throw err;
    }
  }
}
