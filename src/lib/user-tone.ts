// lib/user-tone.ts

import { client } from "./weaviate";

export async function getUserToneProfile(username: string): Promise<string> {
  if (!username) {
    return "Không rõ người dùng là ai. Phản hồi lịch sự và giữ khoảng cách.";
  }

  try {
    const result = await client.graphql
      .get()
      .withClassName("VuToneProfile")
      .withFields("tone")
      .withWhere({
        path: ["username"],
        operator: "Equal",
        valueText: username,
      })
      .withLimit(1)
      .do();

    const match = result.data?.Get?.VuToneProfile?.[0];
    const tone = match?.tone ?? "neutral";

    switch (tone) {
      case "roast":
        return `Bạn đang nói chuyện với ${username}, người thân quen. Thoải mái cà khịa, châm chọc xúc phạm được.`;
      case "tease":
        return `Bạn đang nói chuyện với ${username}, có thể châm chọc, cà khịa, nhưng không được swear/curse/nói bậy`;
      case "formal":
        return `Bạn đang nói chuyện với người dùng ${username}. Nói chuyện thân mật, tâm tình, khen ngợi, tán tỉnh, trêu đùa.`;
      default:
        return `Bạn đang nói chuyện với người lạ tên ${username}. Giữ lịch sự, phản hồi cẩn trọng.`;
    }
  } catch (err) {
    console.warn("[tone] fallback to cautious mode:", err);
    return `Bạn đang nói chuyện với người lạ tên ${username}. Giữ lịch sự, phản hồi cẩn trọng.`;
  }
}
