type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBubble({ role, content }: Props) {
  return (
    <div
      className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
        role === "user"
          ? "bg-blue-100 ml-auto text-right"
          : "bg-gray-100 mr-auto text-left"
      }`}
    >
      {content}
    </div>
  );
}
