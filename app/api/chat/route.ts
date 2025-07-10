import { generalAgent } from "./general-agent";
import { UserService } from "../../../services/user";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const user = await UserService.createIfNotExists(userId);
  console.log("user", user);
  console.log("threadId", threadId);

  const generalStream = await generalAgent.stream(messages, {
    resourceId: user.id,
    threadId,
  });

  return generalStream.toDataStreamResponse();
}
