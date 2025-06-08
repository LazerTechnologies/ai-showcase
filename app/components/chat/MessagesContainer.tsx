"use client";

import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { MultiAgentUIMessage } from "@/app/hooks/useDataStream";
import { Message as UIMessage } from "ai";

interface MessagesContainerProps {
  messages: MultiAgentUIMessage[] | UIMessage[];
}

export function MessagesContainer({ messages }: MessagesContainerProps) {
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
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
