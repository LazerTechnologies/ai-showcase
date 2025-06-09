"use client";

import { useDataStream } from "@/app/hooks/useDataStream";
import { ChatInterface } from "@/app/components/chat";

export default function GeneralChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useDataStream("/api/multi-agent-collaboration");

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      title="Multi-Agent Collaboration"
      description="Watch multiple AI agents work together in real-time, coordinating their responses and building on each other's insights to solve complex problems. In this particular example, try asking this chat to write some TypeScript code for you and see how the agent coordinates with a coder agent to do so."
      setInput={setInput}
      samplePrompts={[
        "Write a TypeScript function that calculates the Fibonacci sequence up to a given number.",
      ]}
    />
  );
}
