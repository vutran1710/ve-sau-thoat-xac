"use client";

import { useChat } from "@ai-sdk/react";
import ChatBubble from "@/components/ChatBubble";
import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const conversationIdRef = useRef<string>("");

  // Generate and persist conversationId once
  useEffect(() => {
    const saved = localStorage.getItem("conversationId");
    if (saved) {
      conversationIdRef.current = saved;
    } else {
      const id = uuidv4();
      localStorage.setItem("conversationId", id);
      conversationIdRef.current = id;
    }
  }, []);

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    onFinish: async (msg) => {
      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          role: msg.role,
          content: msg.content,
        }),
      });
    },
  });

  // Also log user message before sending
  const logUserMessage = async () => {
    if (!input.trim()) return;
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: conversationIdRef.current,
        role: "user",
        content: input,
      }),
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logUserMessage();
    handleSubmit(e);
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Vũ(GP)Trần</h1>
      <div className="space-y-4 mb-6 min-h-[300px]">
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            role={msg.role as "user" | "assistant"}
            content={msg.content}
          />
        ))}
        {status === "submitted" && (
          <div className="text-gray-500 italic">Thinking...</div>
        )}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tâm sự với Vũ Trần..."
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Send
        </button>
      </form>
    </main>
  );
}
