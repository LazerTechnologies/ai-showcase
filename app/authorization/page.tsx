"use client";

import { useState } from "react";
import { useDataStream } from "@/app/hooks/useDataStream";
import { ChatInterface } from "@/app/components/chat";
import { SetRole } from "./SetRole";

export default function AuthorizationChat() {
  // In this example, we're using a simple state to change the role of the user
  const [role, setRole] = useState<"viewer" | "admin">("viewer");

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useDataStream("/api/authorization", {
      // In a real-world application, this would be a JWT token or other authentication mechanism
      // that's decoded on the server-side to get the user and their role
      "x-user-role": role,
    });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      title="Authorization"
      description="This chat uses headers to pass authorization data during the request. This is then used to change the system prompt, which tools are available to the model, and configurations to pass to those tools. Use the viewer role and try to bully the model into showing you the files you don't have access to, and you'll see that it's just not possible. One of the admin-only files is called 'Salary Information.pdf', and it shouldn't show up for viewers and should show up for admins."
      actions={<SetRole role={role} setRole={setRole} />}
    />
  );
}
