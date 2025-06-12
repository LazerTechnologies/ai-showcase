import { User, Bot, Wrench } from "lucide-react";
import Markdown from "react-markdown";
import Codeblock from "../markdown/codeblock";
import { MultiAgentUIMessage } from "@/app/hooks/useDataStream";
import { Message as UIMessage } from "ai";
import { partsToString } from "@/app/utils/message-utils";
import {
  MessageColors,
  USER_MESSAGE_COLORS,
} from "@/app/constants/message-colors";

interface ChatMessageProps {
  message: MultiAgentUIMessage | UIMessage;
  messageColors: MessageColors;
}

// Helper function to check if message contains tool invocations
function isToolMessage(message: MultiAgentUIMessage | UIMessage): boolean {
  return (
    message.parts?.some((part) => part.type === "tool-invocation") ?? false
  );
}

interface AvatarProps {
  isUser: boolean;
  isTool: boolean;
  streamId?: string;
  messageColors?: MessageColors;
}

function Avatar({ isUser, isTool, streamId, messageColors }: AvatarProps) {
  const avatarColor = isUser
    ? USER_MESSAGE_COLORS.avatarColor
    : messageColors?.avatarColor || "";

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
  message: MultiAgentUIMessage | UIMessage;
  isUser: boolean;
  isTool: boolean;
  messageColors?: MessageColors;
}

function MessageContent({
  message,
  isUser,
  isTool,
  messageColors,
}: MessageContentProps) {
  const containerColor = isUser
    ? USER_MESSAGE_COLORS.streamColor
    : messageColors?.streamColor || "";

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

export function ChatMessage({ message, messageColors }: ChatMessageProps) {
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
        <Avatar
          isUser={isUser}
          isTool={isTool}
          streamId={streamId}
          messageColors={messageColors}
        />
        <MessageContent
          message={message}
          isUser={isUser}
          isTool={isTool}
          messageColors={messageColors}
        />
      </div>
    </div>
  );
}
