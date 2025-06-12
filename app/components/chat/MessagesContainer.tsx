"use client";

import { useRef, useEffect, useMemo } from "react";
import { Bot } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { MultiAgentUIMessage } from "@/app/hooks/useDataStream";
import { Message as UIMessage } from "ai";
import {
  DEFAULT_MESSAGE_COLORS,
  MESSAGE_COLOR_SETS,
  MessageColors,
} from "@/app/constants/message-colors";

interface MessagesContainerProps {
  isSingleAgent?: boolean;
  messages: (MultiAgentUIMessage | UIMessage)[];
}

const supportedPartsSequence = ["tool-invocation", "text"];

/**
 * Re-arrange messages so that they only have one part for UI purposes.
 */
const separateMessages = <T extends UIMessage | MultiAgentUIMessage>(
  messages: T[]
): T[] => {
  const result: T[] = [];
  for (const message of messages) {
    if (!message.parts) {
      continue;
    }
    if (message.parts.length === 1) {
      result.push(message);
    } else {
      // Tools go above text
      const sortedParts = message.parts.sort((a, b) => {
        if (a.type === "tool-invocation") {
          return -1;
        }
        if (b.type === "tool-invocation") {
          return 1;
        }
        return 0;
      });
      sortedParts.forEach((part) => {
        if (supportedPartsSequence.includes(part.type)) {
          result.push({ ...message, parts: [part] });
        }
      });
    }
  }
  return result;
};

export function MessagesContainer({
  isSingleAgent = false,
  messages: messagesProp,
}: MessagesContainerProps) {
  const messages = useMemo(
    () => separateMessages(messagesProp),
    [messagesProp]
  );

  const streamColorMap = useMemo(() => {
    // Optimization: if single-agent, return empty map early
    if (isSingleAgent) {
      return new Map<string, MessageColors>();
    }

    const uniqueStreams = new Set<string>();

    messages.forEach((message) => {
      if ("streamId" in message && message.streamId) {
        uniqueStreams.add(message.streamId);
      }
    });

    const streamArray = Array.from(uniqueStreams);
    const colorMap = new Map<string, MessageColors>();

    streamArray.forEach((streamId, index) => {
      const colorIndex = index % MESSAGE_COLOR_SETS.length;
      colorMap.set(streamId, MESSAGE_COLOR_SETS[colorIndex]);
    });

    return colorMap;
  }, [messages, isSingleAgent]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Send a message to begin chatting.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {messages.map((message) => {
            const streamId =
              "streamId" in message ? message.streamId : undefined;
            const messageColors = streamId
              ? streamColorMap.get(streamId)
              : DEFAULT_MESSAGE_COLORS;

            return (
              <ChatMessage
                key={`${message.id}-${message.parts?.[0]?.type}`}
                message={message}
                messageColors={messageColors || DEFAULT_MESSAGE_COLORS}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
