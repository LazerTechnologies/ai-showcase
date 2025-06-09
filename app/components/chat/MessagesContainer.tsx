"use client";

import { useRef, useEffect, useMemo } from "react";
import { Bot } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { MultiAgentUIMessage } from "@/app/hooks/useDataStream";
import { Message as UIMessage } from "ai";

interface MessagesContainerProps {
  messages: MultiAgentUIMessage[] | UIMessage[];
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
  messages: messagesProp,
}: MessagesContainerProps) {
  const messages = useMemo(
    () => separateMessages(messagesProp),
    [messagesProp]
  );
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
          {messages.map((message) => (
            <ChatMessage
              key={`${message.id}-${message.parts?.[0]?.type}`}
              message={message}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
