import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { StoreCreditService } from "../../../../services/store-credit";
import { validateRuntimeContext } from "../shared";

export const offerStoreCreditTool = createTool({
  id: "offer-store-credit",
  description: "Offer store credit to a dissatisfied customer as compensation",
  inputSchema: z.object({
    amount: z
      .string()
      .describe(
        "Amount of store credit to offer (as string, not including $ or other currency symbols)"
      ),
    reason: z.string().describe("Reason for offering the store credit"),
    ticketId: z.string().describe("Associated ticket ID (required)"),
  }),
  outputSchema: z.object({
    creditId: z.string(),
    amount: z.string(),
    expirationDate: z.string(),
    message: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const { userId } = validateRuntimeContext(runtimeContext);

      const existingCredits = await StoreCreditService.getCreditsByTicket({
        requestingUserId: userId,
        ticketId: context.ticketId,
      });

      if (existingCredits.length > 0) {
        return {
          creditId: existingCredits[0].id,
          amount: existingCredits[0].amount,
          expirationDate: existingCredits[0].expirationDate.toISOString(),
          message: `A store credit of ${existingCredits[0].amount} has already been issued for ticket ${context.ticketId}. Please check your account for details.`,
          success: false,
        };
      }

      const storeCredit = await StoreCreditService.createStoreCredit({
        requestingUserId: userId,
        creditData: {
          amount: context.amount,
          reason: context.reason,
          ticketId: context.ticketId,
        },
      });

      return {
        creditId: storeCredit.id,
        amount: context.amount,
        expirationDate: storeCredit.expirationDate.toISOString(),
        message: `I've issued you $${
          context.amount
        } in store credit (Credit ID: ${storeCredit.id}) as compensation for ${
          context.reason
        }. This credit will expire on ${new Date(
          storeCredit.expirationDate
        ).toLocaleDateString()} and can be used on any future purchase. You should receive an email confirmation shortly.`,
        success: true,
      };
    } catch (error) {
      console.error("Error creating store credit:", error);
      return {
        creditId: "",
        amount: "0",
        expirationDate: "",
        message:
          "There was an error issuing the store credit. Please try again.",
        success: false,
      };
    }
  },
});
