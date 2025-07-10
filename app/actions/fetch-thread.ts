"use server";

import { threadMemory } from "@/app/api/memory";
import { UserService } from "../../services/user";

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
  return { messages: uiMessages, resourceId: user.id };
}
