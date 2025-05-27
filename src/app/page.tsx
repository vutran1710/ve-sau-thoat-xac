"use client";

import { useChat } from "@ai-sdk/react";
import ChatBubble from "@/components/ChatBubble";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const conversationIdRef = useRef<string>("");
  const [username, setUsername] = useState<string | null>(null);
  const [askName, setAskName] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("conversationId");
    if (saved) {
      conversationIdRef.current = saved;
    } else {
      const id = uuidv4();
      localStorage.setItem("conversationId", id);
      conversationIdRef.current = id;
    }

    const savedName = localStorage.getItem("vu-username");
    if (savedName) {
      setUsername(savedName);
    } else {
      setAskName(true);
    }
  }, []);

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    body: { username },
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

  if (askName) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-xl mb-4 font-semibold">Tên bạn là gì?</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const value = (form.name as unknown as HTMLInputElement).value
              .trim()
              .toLowerCase();
            if (value) {
              localStorage.setItem("vu-username", value);
              setUsername(value);
              setAskName(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            name="name"
            placeholder="Nhập tên..."
            className="border px-4 py-2 rounded"
          />
          <button className="bg-black text-white px-4 py-2 rounded">Vào</button>
        </form>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto min-h-screen flex flex-col px-4 pt-10 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Vũ(GP)Trần</h1>

      <div className="wrapper flex-1 overflow-y-auto space-y-4 mb-6">
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            role={msg.role as "user" | "assistant"}
            content={msg.content}
          />
        ))}
        {status === "submitted" && (
          <div className="text-gray-500 italic">Đang suy nghĩ...</div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 pb-20">
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
