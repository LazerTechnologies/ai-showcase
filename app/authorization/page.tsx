"use client";

import { useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { SetRole } from "./SetRole";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { getPrefixedThreadId } from "@/app/utils/message-utils";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";

const THREAD_PREFIX = "authorization";

export default function AuthorizationChat() {
  // In this example, we're using a simple state to change the role of the user
  const [role, setRole] = useState<"viewer" | "admin">("viewer");
  const [input, setInput] = useState("");
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/authorization",
      // credentials: 'include',
      // headers: { 'Custom-Header': 'value' },
    }),
  });
  const { isFetched } = useThreadQuery(THREAD_PREFIX, (thread) => {
    if (thread?.messages) {
      setMessages(thread.messages);
    }
  });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={(e) => setInput(e.target.value)}
      handleSubmit={(e) => {
        e.preventDefault();
        sendMessage(
          {
            text: input,
          },
          {
            body: {
              threadId: getPrefixedThreadId(THREAD_PREFIX),
              userId: localStorage.getItem(USER_ID_STORAGE_KEY),
              // In a real-world application, this would be a JWT token or other authentication mechanism
              // that's decoded on the server-side to get the user and their role
              role: role,
            },
          }
        );
      }}
      isLoading={status === "streaming"}
      isResponseLoading={status === "submitted"}
      isLoadingInitialMessages={!isFetched}
      title="Authorization"
      description="This chat uses body parameters to pass authorization data during the request. This is then used to change the system prompt, which tools are available to the model, and configurations to pass to those tools. Use the viewer role and try to bully the model into showing you the files you don't have access to, and you'll see that it's just not possible. One of the admin-only files is called 'Salary Information.pdf', and it shouldn't show up for viewers and should show up for admins."
      actions={<SetRole role={role} setRole={setRole} />}
      setInput={setInput}
      samplePrompts={["Fetch the file 'Salary Information.pdf' from my files"]}
      isSingleAgent
    />
  );
}
