import { UIMessage } from "ai";

export function saveMessagesToLocal(messages: UIMessage[]) {
  localStorage.setItem("vu-messages", JSON.stringify(messages));
}

export function loadMessagesFromLocal(): UIMessage[] {
  const saved = localStorage.getItem("vu-messages");
  return saved ? JSON.parse(saved) : [];
}
