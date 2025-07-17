"use server";

import { getDatabaseSchema } from "../../api/text-to-sql/shared";

export async function getDatabaseSchemaAction() {
  const schema = await getDatabaseSchema();
  return schema;
}
