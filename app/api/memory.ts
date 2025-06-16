import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { fastembed } from "@mastra/fastembed";

const host = process.env.POSTGRES_HOST!;
const port = 5432;
const user = process.env.POSTGRES_USER!;
const database = process.env.POSTGRES_DB!;
const password = process.env.POSTGRES_PASSWORD!;
const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require`;

const storage = new PostgresStore({
  host,
  port,
  user,
  database,
  password,
  ssl: true,
});
const vector = new PgVector({ connectionString });

const createMemoryWithScope = (scope: "thread" | "resource") =>
  new Memory({
    embedder: fastembed,
    storage,
    vector,
    options: {
      lastMessages: 10,
      semanticRecall: {
        topK: 3,
        messageRange: 2,
        scope,
      },
    },
  });

/**
 * Memory for thread-specific context
 */
export const threadMemory = createMemoryWithScope("thread");

/**
 * Memory for resource-specific context (eg. all user/organization/group threads)
 */
export const resourceMemory = createMemoryWithScope("resource");
