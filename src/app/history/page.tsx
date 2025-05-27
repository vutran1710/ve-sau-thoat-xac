"use client";

import { useEffect, useState } from "react";

type Message = {
  role: string;
  content: string;
  created_at: string;
};

export default function HistoryPage() {
  const [conversationIds, setConversationIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch("/api/log/conversations")
      .then((res) => res.json())
      .then((data) => setConversationIds(data.ids));
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetch(`/api/log?conversationId=${selectedId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data.messages));
    }
  }, [selectedId]);

  return (
    <main className="max-w-4xl mx-auto py-10 px-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Conversation History
      </h1>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Select a conversation:</label>
        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Choose --</option>
          {conversationIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-md ${
                msg.role === "user"
                  ? "bg-blue-50 text-right"
                  : "bg-gray-100 text-left"
              }`}
            >
              <div className="text-sm text-gray-500">{msg.role}</div>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
