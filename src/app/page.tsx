"use client";

import { useChat } from "@ai-sdk/react";
import ChatBubble from "@/components/ChatBubble";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { loadMessagesFromLocal, saveMessagesToLocal } from "@/lib/local";

export default function Home() {
  const conversationIdRef = useRef<string>("");
  const [username, setUsername] = useState<string | null>(null);
  const [askName, setAskName] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Initialize conversation ID and username
  useEffect(() => {
    const id = localStorage.getItem("conversationId") || uuidv4();
    localStorage.setItem("conversationId", id);
    conversationIdRef.current = id;

    const savedName = localStorage.getItem("vu-username");
    if (savedName) {
      setUsername(savedName);
    } else {
      setAskName(true);
    }

    const restored = loadMessagesFromLocal();
    if (restored.length) setMessages(restored);
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    onFinish: async (msg) => {
      const updated = [...messages, msg];
      saveMessagesToLocal(updated);
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

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending || !input.trim()) return;

    setSending(true);
    await logUserMessage();
    handleSubmit(e);
    setSending(false);
  };

  if (askName) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-xl mb-4 font-semibold">Tên bạn là gì?</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = (formData.get("name") as string).trim().toLowerCase();
            if (name) {
              localStorage.setItem("vu-username", name);
              setUsername(name);
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
    <main className="max-w-2xl mx-auto h-screen flex flex-col px-4 pt-10 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Vũ(GP)Trần</h1>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-1 z-10">
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
        <div ref={scrollRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="flex gap-2 py-4 sticky bottom-0 input-form"
      >
        <input
          value={input}
          onChange={handleInputChange}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nói với Vũ..."
        />
        <button
          type="submit"
          disabled={sending}
          className={`bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 ${
            sending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Send
        </button>
      </form>
    </main>
  );
}
