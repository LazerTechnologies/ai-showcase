import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "./tools/weather";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { PostgresStore, PgVector } from "@mastra/pg";
import { fastembed } from "@mastra/fastembed";

const connectionString = process.env.DATABASE_URL!;

const parsedConnectionString = new URL(connectionString);
const host = parsedConnectionString.hostname;
const port = Number(parsedConnectionString.port);
const user = parsedConnectionString.username;
const database = parsedConnectionString.pathname.slice(1);
const password = parsedConnectionString.password;

const memoryProduction = new Memory({
  storage: new PostgresStore({
    host,
    port,
    user,
    database,
    password,
  }),
  embedder: fastembed,
  vector: new PgVector({ connectionString }),
  options: {
    lastMessages: 30,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
    },
  },
});

const memoryDevelopment = new Memory({
  storage: new LibSQLStore({
    url: "file:../../memory.db",
  }),
});

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
  memory:
    process.env.APP_ENV === "production" ? memoryProduction : memoryDevelopment,
});
