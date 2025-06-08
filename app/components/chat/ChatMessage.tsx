import { User, Bot, Wrench } from "lucide-react";
import Markdown from "react-markdown";
import Codeblock from "../markdown/codeblock";
import { StreamMessage } from "@/app/hooks/useDataStream";
import { Message as UIMessage } from "ai";
import { partsToString } from "@/app/utils/message-utils";

interface ChatMessageProps {
  message: StreamMessage | UIMessage;
}

// Helper function to check if message contains tool invocations
function isToolMessage(message: StreamMessage | UIMessage): boolean {
  return (
    message.parts?.some((part) => part.type === "tool-invocation") ?? false
  );
}

// Define colors for different stream IDs
const getStreamColor = (streamId?: string) => {
  if (!streamId) return "bg-secondary text-secondary-foreground";

  const colors = {
    "general-agent":
      "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
    "delegate-agent":
      "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
    "coder-agent":
      "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
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
    "delegate-agent": "bg-blue-500 text-white",
    "coder-agent": "bg-green-500 text-white",
    "research-agent": "bg-green-500 text-white",
    "code-agent": "bg-purple-500 text-white",
    "analysis-agent": "bg-orange-500 text-white",
  };

  return colors[streamId as keyof typeof colors] || "bg-gray-500 text-white";
};

interface AvatarProps {
  isUser: boolean;
  isTool: boolean;
  streamId?: string;
}

function Avatar({ isUser, isTool, streamId }: AvatarProps) {
  const avatarColor = isUser
    ? "bg-primary text-primary-foreground"
    : getAvatarColor(streamId);

  const icon = isUser ? (
    <User size={16} />
  ) : isTool ? (
    <Wrench size={16} />
  ) : (
    <Bot size={16} />
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${avatarColor}`}
      >
        {icon}
      </div>
      {!isUser && streamId && (
        <div className="text-xs text-muted-foreground text-center max-w-20 truncate">
          {streamId}
        </div>
      )}
    </div>
  );
}

interface MessageContentProps {
  message: StreamMessage | UIMessage;
  isUser: boolean;
  isTool: boolean;
  streamId?: string;
}

function MessageContent({
  message,
  isUser,
  isTool,
  streamId,
}: MessageContentProps) {
  const containerColor = isUser
    ? "bg-primary text-primary-foreground"
    : getStreamColor(streamId);

  const borderClass = isTool ? "border border-opacity-20" : "";
  const content = partsToString(message.parts);

  if (isTool) {
    return (
      <div className={`rounded-lg px-4 py-2 ${containerColor} ${borderClass}`}>
        <div className="text-sm font-medium flex items-center gap-2">
          <Wrench size={14} />
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg px-4 py-2 ${containerColor}`}>
      <div className="text-sm whitespace-pre-wrap">
        <Markdown
          components={{
            code: ({ node, ...props }) => <Codeblock node={node} {...props} />,
          }}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isTool = isToolMessage(message);
  const streamId = "streamId" in message ? message.streamId : undefined;

  return (
    <div
      className={`flex gap-3 p-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex gap-3 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Avatar isUser={isUser} isTool={isTool} streamId={streamId} />
        <MessageContent
          message={message}
          isUser={isUser}
          isTool={isTool}
          streamId={streamId}
        />
      </div>
    </div>
  );
}
