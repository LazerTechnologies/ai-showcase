import { db } from "../app/db/db";
import { storeCreditTable } from "../app/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export type StoreCredit = typeof storeCreditTable.$inferSelect;
export type NewStoreCredit = typeof storeCreditTable.$inferInsert;

// Use Pick to create the type for store credit creation data
export type CreateStoreCreditData = Pick<
  NewStoreCredit,
  "amount" | "reason" | "ticketId"
>;

export class StoreCreditService {
  /**
   * Create a new store credit for a user
   */
  static async createStoreCredit({
    requestingUserId,
    creditData,
  }: {
    requestingUserId: string;
    creditData: CreateStoreCreditData;
  }): Promise<StoreCredit> {
    try {
      // Set expiration date to 1 year from now
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      const [newCredit] = await db
        .insert(storeCreditTable)
        .values({
          userId: requestingUserId,
          ticketId: creditData.ticketId,
          amount: creditData.amount,
          reason: creditData.reason,
          expirationDate,
        })
        .returning();

      return newCredit;
    } catch (error) {
      console.error("Error creating store credit:", error);
      throw new Error("Failed to create store credit");
    }
  }

  /**
   * Get all store credits for a user
   */
  static async getCreditsByUser({
    requestingUserId,
  }: {
    requestingUserId: string;
  }): Promise<StoreCredit[]> {
    try {
      const credits = await db
        .select()
        .from(storeCreditTable)
        .where(eq(storeCreditTable.userId, requestingUserId));

      return credits;
    } catch (error) {
      console.error("Error fetching store credits:", error);
      throw new Error("Failed to fetch store credits");
    }
  }

  /**
   * Get available (unused and not expired) store credits for a user
   */
  static async getAvailableCreditsByUser({
    requestingUserId,
  }: {
    requestingUserId: string;
  }): Promise<StoreCredit[]> {
    try {
      const credits = await db
        .select()
        .from(storeCreditTable)
        .where(
          and(
            eq(storeCreditTable.userId, requestingUserId),
            isNull(storeCreditTable.usedAt)
          )
        );

      const now = new Date();

      // Filter out expired credits
      return credits.filter((credit: StoreCredit) => {
        const expirationDate = new Date(credit.expirationDate);
        return expirationDate > now;
      });
    } catch (error) {
      console.error("Error fetching available store credits:", error);
      throw new Error("Failed to fetch available store credits");
    }
  }

  /**
   * Get a specific store credit by ID, ensuring the user has access to it
   */
  static async getCreditById({
    requestingUserId,
    creditId,
  }: {
    requestingUserId: string;
    creditId: string;
  }): Promise<StoreCredit | null> {
    try {
      const [credit] = await db
        .select()
        .from(storeCreditTable)
        .where(
          and(
            eq(storeCreditTable.id, creditId),
            eq(storeCreditTable.userId, requestingUserId)
          )
        );

      return credit || null;
    } catch (error) {
      console.error("Error fetching store credit:", error);
      throw new Error("Failed to fetch store credit");
    }
  }

  /**
   * Mark a store credit as used
   */
  static async useStoreCredit({
    requestingUserId,
    creditId,
  }: {
    requestingUserId: string;
    creditId: string;
  }): Promise<StoreCredit | null> {
    try {
      // First check if the credit exists and belongs to the user
      const existingCredit = await this.getCreditById({
        requestingUserId,
        creditId,
      });
      if (!existingCredit) {
        return null;
      }

      // Check if credit is already used
      if (existingCredit.usedAt) {
        throw new Error("Store credit has already been used");
      }

      // Check if credit is expired
      const now = new Date();
      if (new Date(existingCredit.expirationDate) <= now) {
        throw new Error("Store credit has expired");
      }

      const [updatedCredit] = await db
        .update(storeCreditTable)
        .set({
          usedAt: new Date(),
        })
        .where(
          and(
            eq(storeCreditTable.id, creditId),
            eq(storeCreditTable.userId, requestingUserId)
          )
        )
        .returning();

      return updatedCredit || null;
    } catch (error) {
      console.error("Error using store credit:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to use store credit");
    }
  }

  /**
   * Calculate total available credit amount for a user
   */
  static async getTotalAvailableCredit({
    requestingUserId,
  }: {
    requestingUserId: string;
  }): Promise<number> {
    try {
      const availableCredits = await this.getAvailableCreditsByUser({
        requestingUserId,
      });

      return availableCredits.reduce((total, credit) => {
        return total + parseFloat(credit.amount);
      }, 0);
    } catch (error) {
      console.error("Error calculating total available credit:", error);
      throw new Error("Failed to calculate total available credit");
    }
  }

  /**
   * Get store credits associated with a specific ticket
   */
  static async getCreditsByTicket({
    requestingUserId,
    ticketId,
  }: {
    requestingUserId: string;
    ticketId: string;
  }): Promise<StoreCredit[]> {
    try {
      const credits = await db
        .select()
        .from(storeCreditTable)
        .where(
          and(
            eq(storeCreditTable.userId, requestingUserId),
            eq(storeCreditTable.ticketId, ticketId)
          )
        );

      return credits;
    } catch (error) {
      console.error("Error fetching credits by ticket:", error);
      throw new Error("Failed to fetch credits by ticket");
    }
  }
}
