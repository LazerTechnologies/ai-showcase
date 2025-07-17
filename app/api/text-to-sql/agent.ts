import { Agent } from "@mastra/core/agent";
import { threadMemory } from "../memory";
import { flash } from "../../utils/models";
import { createTool } from "@mastra/core";
import { z } from "zod";
import { databaseSchema, getDatabaseSchema } from "./shared";
import { db } from "../../db/db";
import { sql } from "drizzle-orm";
import { pluralize } from "../../utils/string";

const schemaFetcher = createTool({
  id: "schema-fetcher",
  description: "Fetch the schema of the database",
  inputSchema: z.object({
    // TODO: Add database name/connection string
  }),
  outputSchema: z.object({
    schema: databaseSchema,
  }),
  execute: async () => {
    const schema = await getDatabaseSchema();
    return {
      schema: schema,
    };
  },
});

const executeQuery = createTool({
  id: "execute-query",
  description: "Execute a SQL query",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    results: z.array(z.any()),
  }),
  execute: async ({ context }) => {
    // Validate the query
    const bannedKeywords = ["DROP", "DELETE", "UPDATE", "ALTER", "TRUNCATE"];
    const bannedKeywordsFound = bannedKeywords.find((keyword) =>
      context.query.includes(keyword)
    );
    if (bannedKeywordsFound) {
      throw new Error(
        `This query is not allowed: ${bannedKeywordsFound} ${pluralize(
          "is",
          bannedKeywords.length,
          "are"
        )} not allowed`
      );
    }

    const results = await db.execute(sql.raw(context.query));
    return { results: results.rows };
  },
});

export const textToSqlAgent = new Agent({
  name: "text-to-sql-agent",
  instructions: `You are an expert SQL assistant that helps users convert natural language queries into SQL statements and provides intelligent analysis of database results.

**Guidelines:**
- Always start by understanding the database schema before generating queries
- Generate efficient, readable SQL queries
- Use appropriate JOINs, WHERE clauses, and aggregations as needed
- Validate that your queries are safe and won't cause performance issues
- Provide clear explanations of what the query does
- Summarize results in a way that's easy for non-technical users to understand
- If a query might return too many results, suggest using LIMIT clauses

**Safety:**
- Only execute SELECT queries unless explicitly requested otherwise
- Validate all inputs to prevent SQL injection
- Suggest performance optimizations when appropriate
- Warn users about potentially expensive operations

Start by greeting the user and asking what data they'd like to explore or what question they have about their database.`,
  model: flash,
  tools: {
    schemaFetcher,
    executeQuery,
  },
  memory: threadMemory,
});
