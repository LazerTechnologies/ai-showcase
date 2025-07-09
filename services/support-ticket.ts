import { db } from "../app/db/db";
import { supportTicketsTable } from "../app/db/schema";
import { eq, and } from "drizzle-orm";

export type SupportTicket = typeof supportTicketsTable.$inferSelect;
export type NewSupportTicket = typeof supportTicketsTable.$inferInsert;

export type TicketStatus = SupportTicket["status"];

export type CreateTicketData = Pick<NewSupportTicket, "description">;

export class SupportTicketService {
  /**
   * Create a new support ticket for a user
   */
  static async createTicket({
    userId,
    ticketData,
  }: {
    userId: string;
    ticketData: CreateTicketData;
  }): Promise<SupportTicket> {
    try {
      const [newTicket] = await db
        .insert(supportTicketsTable)
        .values({
          userId,
          description: ticketData.description,
          status: "open",
        })
        .returning();

      return newTicket;
    } catch (error) {
      console.error("Error creating support ticket:", error);
      throw new Error("Failed to create support ticket");
    }
  }

  /**
   * Get all tickets for a user with optional status filter
   */
  static async getTicketsByUser({
    requestingUserId,
    statusFilter,
  }: {
    requestingUserId: string;
    statusFilter?: TicketStatus | "all";
  }): Promise<SupportTicket[]> {
    try {
      let query;

      if (statusFilter && statusFilter !== "all") {
        query = db
          .select()
          .from(supportTicketsTable)
          .where(
            and(
              eq(supportTicketsTable.userId, requestingUserId),
              eq(supportTicketsTable.status, statusFilter)
            )
          );
      } else {
        query = db
          .select()
          .from(supportTicketsTable)
          .where(eq(supportTicketsTable.userId, requestingUserId));
      }

      const tickets = await query;
      return tickets;
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      throw new Error("Failed to fetch support tickets");
    }
  }

  /**
   * Get a specific ticket by ID, ensuring the user has access to it
   */
  static async getTicketById({
    requestingUserId,
    ticketId,
  }: {
    requestingUserId: string;
    ticketId: string;
  }): Promise<SupportTicket | null> {
    try {
      const [ticket] = await db
        .select()
        .from(supportTicketsTable)
        .where(
          and(
            eq(supportTicketsTable.id, ticketId),
            eq(supportTicketsTable.userId, requestingUserId)
          )
        );

      return ticket || null;
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      throw new Error("Failed to fetch ticket details");
    }
  }

  /**
   * Update ticket status (for internal use)
   */
  static async updateTicketStatus({
    requestingUserId,
    ticketId,
    status,
  }: {
    requestingUserId: string;
    ticketId: string;
    status: TicketStatus;
  }): Promise<SupportTicket | null> {
    try {
      const [updatedTicket] = await db
        .update(supportTicketsTable)
        .set({
          status,
        })
        .where(
          and(
            eq(supportTicketsTable.id, ticketId),
            eq(supportTicketsTable.userId, requestingUserId)
          )
        )
        .returning();

      return updatedTicket || null;
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw new Error("Failed to update ticket status");
    }
  }
}
