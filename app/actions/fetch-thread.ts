"use server";

import { threadMemory } from "@/app/api/memory";

export async function fetchThread(threadId: string, userId: string) {
  const thread = await threadMemory.getThreadById({ threadId });
  if (!thread) {
    return null;
  }
  if (thread.resourceId !== userId) {
    throw new Error("Unauthorized");
  }
  const { uiMessages } = await threadMemory.query({
    threadId,
    resourceId: userId,
  });
  return { messages: uiMessages, resourceId: userId };
}
