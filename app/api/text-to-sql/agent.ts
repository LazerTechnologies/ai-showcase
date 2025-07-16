import { Agent } from "@mastra/core/agent";
import { threadMemory } from "../memory";
import { flash } from "../../utils/models";
import { createTool } from "@mastra/core";
import { z } from "zod";
import { db } from "../../db/db";
import { sql } from "drizzle-orm";

const schemaFilter = new Set(["public"]);

const relationshipSchema = z.object({
  constraint_name: z.string(),
  foreign_table_schema: z.string(),
  foreign_table_name: z.string(),
  foreign_column_name: z.string(),
  table_schema: z.string(),
  table_name: z.string(),
  column_name: z.string(),
});

const columnSchema = z.object({
  column_name: z.string(),
  ordinal_position: z.number(),
  column_default: z.string().nullable(),
  is_nullable: z.string().transform((val) => val === "YES"),
  data_type: z.string(),
  table_schema: z.string(),
  table_name: z.string(),
});

type Table = {
  name: string;
  columns: Record<
    string,
    z.infer<typeof columnSchema> & {
      foreignKey?: Pick<
        z.infer<typeof relationshipSchema>,
        | "constraint_name"
        | "foreign_table_schema"
        | "foreign_table_name"
        | "foreign_column_name"
      >;
    }
  >;
};

const schemaFetcher = createTool({
  id: "schema-fetcher",
  description: "Fetch the schema of the database",
  inputSchema: z.object({
    // TODO: Add database name/connection string
  }),
  outputSchema: z.object({
    schema: z.record(
      z.string(),
      z.object({
        name: z.string(),
        columns: z.record(
          z.string(),
          z.object({
            column_name: z.string(),
            ordinal_position: z.number(),
          })
        ),
      })
    ),
  }),
  execute: async () => {
    const columnsResult = await db.execute(sql`SELECT
      table_schema,
      table_name,
      column_name,
      ordinal_position,
      column_default,
      is_nullable,
      udt_name AS data_type -- 'udt_name' gives the underlying base type
    FROM
      information_schema.columns
    WHERE
      table_schema IN (${sql.join(Array.from(schemaFilter), sql`, `)})
    ORDER BY
      table_schema,
      table_name,
      ordinal_position;`);

    const columns = z.array(columnSchema).safeParse(columnsResult.rows);
    if (!columns.success) {
      throw new Error("Failed to parse columns");
    }

    const relationshipsResult = await db.execute(sql`SELECT
        con.constraint_name,
        con.unique_constraint_schema AS foreign_table_schema,
        rel.table_name AS foreign_table_name,
        rel.column_name AS foreign_column_name,
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name
    FROM
        information_schema.referential_constraints AS con
    JOIN
        information_schema.key_column_usage AS kcu
        ON con.constraint_name = kcu.constraint_name AND con.constraint_schema = kcu.table_schema
    JOIN
        information_schema.key_column_usage AS rel
        ON con.unique_constraint_name = rel.constraint_name AND con.unique_constraint_schema = rel.table_schema
    WHERE
        kcu.table_schema IN (${sql.join(Array.from(schemaFilter), sql`, `)});`);

    const relationships = z
      .array(relationshipSchema)
      .safeParse(relationshipsResult.rows);
    if (!relationships.success) {
      throw new Error("Failed to parse relationships");
    }

    const schema: Record<string, Table> = {};
    columns.data.forEach((column) => {
      if (!schema[column.table_name]) {
        schema[column.table_name] = {
          name: column.table_name,
          columns: {},
        };
      }
      schema[column.table_name].columns[column.column_name] = column;
    });
    relationships.data.forEach((relationship) => {
      if (
        schema[relationship.table_name] &&
        schema[relationship.table_name].columns[relationship.column_name]
      ) {
        schema[relationship.table_name].columns[relationship.column_name] = {
          ...schema[relationship.table_name].columns[relationship.column_name],
          foreignKey: relationship,
        };
      }
    });

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
