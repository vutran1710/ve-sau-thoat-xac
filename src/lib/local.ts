export function saveMessagesToLocal(messages: any[]) {
  localStorage.setItem("vu-messages", JSON.stringify(messages));
}

export function loadMessagesFromLocal(): any[] {
  const saved = localStorage.getItem("vu-messages");
  return saved ? JSON.parse(saved) : [];
}
