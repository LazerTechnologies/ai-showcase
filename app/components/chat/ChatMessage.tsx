import { type Message } from "@ai-sdk/react";
import { User, Bot } from "lucide-react";
import Markdown from "react-markdown";
import Codeblock from "../markdown/codeblock";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 p-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex gap-3 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">
            <Markdown
              components={{
                code: ({ node, ...props }) => (
                  <Codeblock node={node} {...props} />
                ),
              }}
            >
              {message.content}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
