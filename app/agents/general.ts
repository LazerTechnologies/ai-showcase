/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "./tools/weather";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";
import { UpstashStore, UpstashVector } from "@mastra/upstash";

function getMemory(): Memory {
  if (process.env.APP_ENV === "production") {
    return new Memory({
      embedder: fastembed,
      storage: new UpstashStore({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      vector: new UpstashVector({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      options: {
        lastMessages: 10,
        semanticRecall: {
          topK: 3,
          messageRange: 2,
        },
      },
    });
  } else {
    return new Memory({
      storage: new LibSQLStore({
        url: "file:../../memory.db",
      }),
    });
  }
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generalAgent = new Agent({
  name: "general-agent",
  instructions:
    "You are a general-purpose agent. You're able to use tools or respond without tools.",
  model: google("gemini-2.0-flash-exp"),
  tools: {
    weatherTool,
  },
});
