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

const maliciousIntentCheckerAgent = new Agent({
  name: "malicious-intent-checker-agent",
  instructions: `You are an expert SQL assistant. You will be given a SQL query and you will need to check if it is malicious.

  Check for the following:
  - Dangerous SQL Commands: Look for commands like DROP TABLE, DELETE FROM, TRUNCATE TABLE, ALTER TABLE, CREATE TABLE, GRANT, REVOKE, SHUTDOWN, EXEC, XP_CMDSHELL, or any other commands that could modify schema, delete data, or execute operating system commands
  - Union-Based Attacks: Detect UNION SELECT statements, especially when combined with common information disclosure queries (e.g., UNION SELECT null, table_name, null FROM information_schema.tables).
  - SQL Injection: Look for any signs of SQL injection, such as single quotes, backticks, or other characters that could be used to inject malicious SQL code.
  - Blind SQL Injection: Look for any signs of blind SQL injection, such as error messages that are not helpful or that contain information that could be used to exploit the database.
  - Time-Based SQL Injection: Look for any signs of time-based SQL injection, such as delays in the response time of the query.
  - Error-Based SQL Injection: Look for any signs of error-based SQL injection, such as error messages that are not helpful or that contain information that could be used to exploit the database.
  - Blind Time-Based SQL Injection: Look for any signs of blind time-based SQL injection, such as delays in the response time of the query.
  - Blind Error-Based SQL Injection: Look for any signs of blind error-based SQL injection, such as error messages that are not helpful or that contain information that could be used to exploit the database.
  - Out-of-Band SQLi Indicators: Check for attempts to initiate external connections, such as LOAD_FILE(), OUTFILE, DUMPFILE, or functions that could trigger DNS lookups or HTTP requests from the database server.
  - Data Exfiltration: Look for patterns indicative of attempts to extract large amounts of data, such as SELECT ... INTO OUTFILE or UNION SELECT statements designed to dump entire tables.
  - Obfuscation Techniques: Malicious actors often use obfuscation (e.g., /* */ comments within keywords, varying case, extra spaces) to evade detection.
  - Comment Characters: Pay attention to comment characters like --, /* */, or # that might be used to prematurely terminate a legitimate query and append malicious code. Regular comments are okay though! Eg. clearly just explaining a part of the query.
  `,
  model: flash,
  tools: {},
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
    const maliciousIntent = await maliciousIntentCheckerAgent.generate(
      `Check the following query for malicious intent: ${context.query}`,
      {
        output: z.object({
          safetyLevel: z.enum(["malicious", "safe", "unknown"]),
          explanation: z.string(),
        }),
      }
    );
    console.log(maliciousIntent.object);

    if (maliciousIntent.object.safetyLevel === "malicious") {
      throw new Error(maliciousIntent.object.explanation);
    } else if (maliciousIntent.object.safetyLevel === "unknown") {
      console.warn(
        `Unknown safety level for query. Explanation: ${maliciousIntent.object.explanation}. Query: ${context.query}`
      );
    }

    // Validate the query
    // In a real app, you'd want to make sure the database user being used by this tool
    // has very limited permissions so that it's safe at the database level too. There
    // could also be other checks to put in place beyond just these keywords.
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
