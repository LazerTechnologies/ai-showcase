"use client";

import { useMultiAgentStream } from "@/app/hooks/useMultiAgentStream";
import { ChatInterface } from "@/app/components/chat";
import { useThreadQuery } from "@/app/hooks/use-thread-query";

const THREAD_PREFIX = "multi-agent";

export default function GeneralChat() {
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);
  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useMultiAgentStream({
      apiEndpoint: "/api/multi-agent-collaboration",
      threadPrefix: THREAD_PREFIX,
      initialMessages: thread?.messages,
    });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={status === "streaming"}
      isResponseLoading={status === "submitted"}
      isLoadingInitialMessages={!isFetched}
      title="Multi-Agent Collaboration"
      description="Watch multiple AI agents work together in real-time, coordinating their responses and building on each other's insights to solve complex problems. In this particular example, try asking this chat to write some TypeScript code for you and see how the agent coordinates with a coder agent to do so. Note: this conversation doesn't support conversation history."
      setInput={setInput}
      samplePrompts={[
        "Write a TypeScript function that calculates the Fibonacci sequence up to a given number.",
      ]}
    />
  );
}
