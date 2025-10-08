"use server";

import { threadMemory } from "@/app/api/memory";
import { UserService } from "../../services/user";
import { convertMessages } from "@mastra/core/agent";

/**
 * Outputs the thread in the AIV5.UI format for use in useChat hooks
 * `convertMessages` is not available client-side, so they're converted here
 */
export async function fetchThread(threadId: string, userUiId: string) {
  const user = await UserService.createIfNotExists(userUiId);
  const thread = await threadMemory.getThreadById({ threadId });
  if (!thread) {
    return null;
  }
  if (thread.resourceId !== user.id) {
    throw new Error("Unauthorized");
  }
  const { uiMessages } = await threadMemory.query({
    threadId,
    resourceId: user.id,
  });
  return { messages: convertMessages(uiMessages).to("AIV5.UI"), resourceId: user.id };
}
