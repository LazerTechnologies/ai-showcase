"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";

export default function CustomerSupportBotChat() {
  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat({
      api: "/api/customer-support-bot",
    });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={status === "streaming"}
      title="Customer Support Bot"
      description="Get help with your orders, returns, account issues, and more. Our AI customer support agent can create tickets, check status, and even offer store credit for exceptional cases. Try telling the agent why you are unhappy with an order."
      samplePrompts={[
        "Hi, I need help with my order",
        "I got the wrong product",
      ]}
      setInput={setInput}
      isSingleAgent
    />
  );
}
