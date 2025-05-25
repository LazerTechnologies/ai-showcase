import { User, Bot } from "lucide-react";
import Markdown from "react-markdown";
import Codeblock from "../markdown/codeblock";
import { StreamMessage } from "@/app/hooks/useDataStream";

interface ChatMessageProps {
  message: StreamMessage;
}

// Define colors for different stream IDs
const getStreamColor = (streamId?: string) => {
  if (!streamId) return "bg-secondary text-secondary-foreground";

  const colors = {
    "general-agent":
      "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
    "research-agent":
      "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
    "code-agent":
      "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
    "analysis-agent":
      "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
  };

  return (
    colors[streamId as keyof typeof colors] ||
    "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
  );
};

const getAvatarColor = (streamId?: string) => {
  if (!streamId) return "bg-secondary text-secondary-foreground";

  const colors = {
    "general-agent": "bg-blue-500 text-white",
    "research-agent": "bg-green-500 text-white",
    "code-agent": "bg-purple-500 text-white",
    "analysis-agent": "bg-orange-500 text-white",
  };

  return colors[streamId as keyof typeof colors] || "bg-gray-500 text-white";
};

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
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser
                ? "bg-primary text-primary-foreground"
                : getAvatarColor(message.streamId)
            }`}
          >
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
          {!isUser && message.streamId && (
            <div className="text-xs text-muted-foreground text-center max-w-20 truncate">
              {message.streamId}
            </div>
          )}
        </div>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : getStreamColor(message.streamId)
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
