import { sql } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, numeric } from "drizzle-orm/pg-core";

const timestamps = {
  created_at: timestamp({ withTimezone: true, mode: "string" })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull(),
  updated_at: timestamp({ withTimezone: true, mode: "string" })
    .default(sql`(now() AT TIME ZONE 'utc'::text)`)
    .notNull()
    .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
};

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  uiId: text("ui_id").notNull().unique(), // In a real application, we would use the primary id rather than letting it be set in the user interface
});

export const supportTicketsTable = pgTable("support_tickets", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  description: text("description").notNull(),
  status: text("status")
    .notNull()
    .$type<"open" | "in-progress" | "resolved" | "closed">(),
  ...timestamps,
});

export const storeCreditTable = pgTable("store_credit", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => supportTicketsTable.id),
  amount: numeric("amount").notNull(),
  reason: text("reason").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  usedAt: timestamp("used_at"),
  ...timestamps,
});
