import { Agent } from "@mastra/core/agent";
import { threadMemory } from "../memory";
import { flash } from "../../utils/models";
import { createTool } from "@mastra/core";
import { z } from "zod";
import { databaseSchema, getDatabaseSchema } from "./shared";

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
- Always be cautious about DELETE or UPDATE operations

**Safety:**
- Only execute SELECT queries unless explicitly requested otherwise
- Validate all inputs to prevent SQL injection
- Suggest performance optimizations when appropriate
- Warn users about potentially expensive operations

Start by greeting the user and asking what data they'd like to explore or what question they have about their database.`,
  model: flash,
  tools: {
    schemaFetcher,
  },
  memory: threadMemory,
});
