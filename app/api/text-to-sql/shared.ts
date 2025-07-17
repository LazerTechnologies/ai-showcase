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

export const tableSchema = z.object({
  name: z.string(),
  columns: z.record(
    z.string(),
    columnSchema.extend({
      foreignKey: relationshipSchema
        .pick({
          constraint_name: true,
          foreign_table_schema: true,
          foreign_table_name: true,
          foreign_column_name: true,
        })
        .optional(),
    })
  ),
});

export const databaseSchema = z.record(z.string(), tableSchema);

export const getDatabaseSchema = async () => {
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

  const schema: z.infer<typeof databaseSchema> = {};
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

  return schema;
};
