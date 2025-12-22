import { User, Bot, Wrench } from "lucide-react";
import Markdown from "react-markdown";
import Codeblock from "../markdown/codeblock";
import { UIMessage } from "ai";
import { isToolAgentPart, partToString } from "@/app/utils/message-utils";
import {
  MessageColors,
  USER_MESSAGE_COLORS,
} from "@/app/constants/message-colors";

interface ChatMessageProps {
  part: UIMessage["parts"][number];
  role: UIMessage["role"];
  messageColors: MessageColors;
}

function isToolPart(part: UIMessage["parts"][number]): boolean {
  return part.type.startsWith("tool-");
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
  part: UIMessage["parts"][number];
  isUser: boolean;
  isTool: boolean;
  messageColors?: MessageColors;
}

function MessageContent({
  part,
  isUser,
  isTool,
  messageColors,
}: MessageContentProps) {
  const containerColor = isUser
    ? USER_MESSAGE_COLORS.streamColor
    : messageColors?.streamColor || "";

  const borderClass = isTool ? "border border-opacity-20" : "";
  const content = partToString(part);

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
    <div className={`rounded-lg px-4 py-2 ${containerColor} overflow-x-auto`}>
      <div className="text-sm whitespace-pre-wrap break-words">
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

export function ChatMessage({ part, role, messageColors }: ChatMessageProps) {
  const isUser = role === "user";

  if (!part) {
    return null;
  }

  const isTool = isToolPart(part);
  const streamId = isToolAgentPart(part) ? part.data.id : undefined;

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
          part={part}
          isUser={isUser}
          isTool={isTool}
          messageColors={messageColors}
        />
      </div>
    </div>
  );
}
