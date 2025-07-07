import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { threadMemory } from "../memory";
import { SupportTicketService } from "../../../services/support-ticket";
import { StoreCreditService } from "../../../services/store-credit";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const createSupportTicketTool = createTool({
  id: "create-support-ticket",
  description: "Create a new support ticket for the customer",
  inputSchema: z.object({
    description: z
      .string()
      .describe("Detailed description of the customer's issue"),
  }),
  outputSchema: z.object({
    ticketId: z.string(),
    status: z.string(),
    message: z.string(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const userId = runtimeContext.get("userId") as string | undefined;
      if (!userId) {
        throw new Error("User ID is required");
      }

      const ticket = await SupportTicketService.createTicket({
        userId,
        ticketData: {
          description: context.description,
        },
      });

      return {
        ticketId: ticket.id,
        status: ticket.status,
        message: `Your support ticket ${ticket.id} has been created successfully. We'll review your issue and get back to you soon.`,
      };
    } catch (error) {
      console.error("Error creating support ticket:", error);
      return {
        ticketId: "",
        status: "error",
        message:
          "There was an error creating your support ticket. Please try again.",
      };
    }
  },
});

const fetchSupportTicketsTool = createTool({
  id: "fetch-support-tickets",
  description: "Fetch all support tickets for the current user",
  inputSchema: z.object({
    status: z
      .enum(["all", "open", "in-progress", "resolved", "closed"])
      .optional()
      .describe("Filter tickets by status"),
  }),
  outputSchema: z.object({
    tickets: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
        status: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    ),
    totalCount: z.number(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const userId = runtimeContext.get("userId") as string | undefined;
      if (!userId) {
        throw new Error("User ID is required");
      }

      const tickets = await SupportTicketService.getTicketsByUser({
        requestingUserId: userId,
        statusFilter: context.status === "all" ? undefined : context.status,
      });

      const ticketSummaries = tickets.map((ticket) => ({
        id: ticket.id,
        description: ticket.description,
        status: ticket.status,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      }));

      return {
        tickets: ticketSummaries,
        totalCount: ticketSummaries.length,
      };
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      return {
        tickets: [],
        totalCount: 0,
      };
    }
  },
});

const getTicketDetailsTool = createTool({
  id: "get-ticket-details",
  description: "Get detailed information about a specific support ticket",
  inputSchema: z.object({
    ticketId: z.string().describe("The ID of the ticket to retrieve"),
  }),
  outputSchema: z.object({
    ticket: z
      .object({
        id: z.string(),
        description: z.string(),
        status: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .optional(),
    found: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const userId = runtimeContext.get("userId") as string | undefined;
      if (!userId) {
        throw new Error("User ID is required");
      }

      const ticket = await SupportTicketService.getTicketById({
        requestingUserId: userId,
        ticketId: context.ticketId,
      });

      if (!ticket) {
        return {
          found: false,
          message: `Ticket ${context.ticketId} not found or you don't have permission to view it.`,
        };
      }

      return {
        ticket: {
          id: ticket.id,
          description: ticket.description,
          status: ticket.status,
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at,
        },
        found: true,
        message: `Retrieved details for ticket ${context.ticketId}`,
      };
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      return {
        found: false,
        message: "There was an error retrieving the ticket details.",
      };
    }
  },
});

const offerStoreCreditTool = createTool({
  id: "offer-store-credit",
  description: "Offer store credit to a dissatisfied customer as compensation",
  inputSchema: z.object({
    amount: z.string().describe("Amount of store credit to offer (as string)"),
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
      const userId = runtimeContext.get("userId") as string | undefined;
      if (!userId) {
        throw new Error("User ID is required");
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

export const customerSupportAgent = new Agent({
  name: "customer-support-agent",
  instructions: `You are a helpful and empathetic customer support agent for an e-commerce website similar to Amazon. Your role is to:

1. **Greet customers warmly** and ask how you can help them today
2. **Listen carefully** to their issues and ask clarifying questions to understand the problem fully
3. **Create support tickets** when customers report issues that need follow-up
4. **Check ticket status** and provide updates when customers ask about existing tickets
5. **Offer store credit** when customers are very dissatisfied or have had a poor experience

**Guidelines:**
- Always be polite, professional, and empathetic
- Ask clarifying questions to understand the full scope of the issue before creating tickets
- When offering store credit, explain the reason and terms clearly, and only offer it if the customer is very dissatisfied or has had a poor experience
- Store credit must be associated with a support ticket
- If a customer seems very upset or mentions words like "terrible", "awful", "worst experience", "never shopping here again", consider offering store credit
- Always provide ticket IDs and reference numbers for tracking
- Summarize next steps clearly for the customer

**Common scenarios to handle:**
- Order not received or delayed
- Defective or wrong products
- Billing issues
- Account access problems
- Return/refund requests
- General product questions

Start each conversation with a friendly greeting and ask how you can assist them today.`,
  model: google("gemini-2.0-flash-exp"),
  tools: {
    createSupportTicketTool,
    fetchSupportTicketsTool,
    getTicketDetailsTool,
    offerStoreCreditTool,
  },
  memory: threadMemory,
});
