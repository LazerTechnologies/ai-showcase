import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Mock database for support tickets
interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "order" | "shipping" | "refund" | "product" | "account" | "other";
  createdAt: string;
  updatedAt: string;
  comments: Array<{
    id: string;
    author: "customer" | "support";
    message: string;
    timestamp: string;
  }>;
}

// Mock ticket storage
const mockTickets: SupportTicket[] = [
  {
    id: "TICKET-001",
    userId: "user-123",
    subject: "Order not received",
    description:
      "I ordered a laptop 2 weeks ago but haven't received it yet. Order #12345",
    status: "in-progress",
    priority: "high",
    category: "shipping",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    comments: [
      {
        id: "comment-1",
        author: "support",
        message:
          "We've contacted the shipping carrier and are tracking your package. It should arrive within 2 business days.",
        timestamp: "2024-01-16T14:30:00Z",
      },
    ],
  },
  {
    id: "TICKET-002",
    userId: "user-123",
    subject: "Defective product received",
    description:
      "The smartphone I received has a cracked screen. I need a replacement.",
    status: "resolved",
    priority: "medium",
    category: "product",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    comments: [
      {
        id: "comment-2",
        author: "support",
        message:
          "We've processed a replacement and it will be shipped today. You should receive it within 3-5 business days.",
        timestamp: "2024-01-12T16:45:00Z",
      },
    ],
  },
];

const createSupportTicketTool = createTool({
  id: "create-support-ticket",
  description: "Create a new support ticket for the customer",
  inputSchema: z.object({
    subject: z.string().describe("Brief subject line for the ticket"),
    description: z
      .string()
      .describe("Detailed description of the customer's issue"),
    category: z
      .enum(["order", "shipping", "refund", "product", "account", "other"])
      .describe("Category of the issue"),
    priority: z
      .enum(["low", "medium", "high", "urgent"])
      .describe("Priority level based on issue severity"),
  }),
  outputSchema: z.object({
    ticketId: z.string(),
    status: z.string(),
    estimatedResolution: z.string(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    // Generate a new ticket ID
    const ticketId = `TICKET-${String(mockTickets.length + 1).padStart(
      3,
      "0"
    )}`;

    const newTicket: SupportTicket = {
      id: ticketId,
      userId: "user-123", // In a real app, this would come from authentication
      subject: context.subject,
      description: context.description,
      status: "open",
      priority: context.priority,
      category: context.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };

    mockTickets.push(newTicket);

    // Determine estimated resolution time based on priority and category
    let estimatedResolution = "3-5 business days";
    if (context.priority === "urgent") {
      estimatedResolution = "24 hours";
    } else if (context.priority === "high") {
      estimatedResolution = "1-2 business days";
    } else if (context.category === "refund") {
      estimatedResolution = "5-7 business days";
    }

    return {
      ticketId,
      status: "open",
      estimatedResolution,
      message: `Your support ticket ${ticketId} has been created successfully. We'll get back to you within ${estimatedResolution}.`,
    };
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
        subject: z.string(),
        status: z.string(),
        priority: z.string(),
        category: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        hasNewComments: z.boolean(),
        latestComment: z.string().optional(),
      })
    ),
    totalCount: z.number(),
  }),
  execute: async ({ context }) => {
    // In a real app, filter by authenticated user ID
    let userTickets = mockTickets.filter(
      (ticket) => ticket.userId === "user-123"
    );

    if (context.status && context.status !== "all") {
      userTickets = userTickets.filter(
        (ticket) => ticket.status === context.status
      );
    }

    const tickets = userTickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      hasNewComments: ticket.comments.length > 0,
      latestComment:
        ticket.comments.length > 0
          ? ticket.comments[ticket.comments.length - 1].message
          : undefined,
    }));

    return {
      tickets,
      totalCount: tickets.length,
    };
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
        subject: z.string(),
        description: z.string(),
        status: z.string(),
        priority: z.string(),
        category: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        comments: z.array(
          z.object({
            id: z.string(),
            author: z.string(),
            message: z.string(),
            timestamp: z.string(),
          })
        ),
      })
      .optional(),
    found: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const ticket = mockTickets.find(
      (t) => t.id === context.ticketId && t.userId === "user-123"
    );

    if (!ticket) {
      return {
        found: false,
        message: `Ticket ${context.ticketId} not found or you don't have permission to view it.`,
      };
    }

    return {
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        comments: ticket.comments,
      },
      found: true,
      message: `Retrieved details for ticket ${context.ticketId}`,
    };
  },
});

const offerStoreCreditTool = createTool({
  id: "offer-store-credit",
  description: "Offer store credit to a dissatisfied customer as compensation",
  inputSchema: z.object({
    amount: z.number().describe("Amount of store credit to offer in dollars"),
    reason: z.string().describe("Reason for offering the store credit"),
    ticketId: z
      .string()
      .optional()
      .describe("Associated ticket ID if applicable"),
  }),
  outputSchema: z.object({
    creditId: z.string(),
    amount: z.number(),
    expirationDate: z.string(),
    message: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ context }) => {
    // Generate a credit ID
    const creditId = `CREDIT-${Date.now()}`;

    // Set expiration date to 1 year from now
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    // In a real app, this would create the credit in the database
    // and send an email to the customer

    return {
      creditId,
      amount: context.amount,
      expirationDate: expirationDate.toISOString(),
      message: `I've issued you $${
        context.amount
      } in store credit (Credit ID: ${creditId}) as compensation for ${
        context.reason
      }. This credit will expire on ${expirationDate.toLocaleDateString()} and can be used on any future purchase. You should receive an email confirmation shortly.`,
      success: true,
    };
  },
});

export const customerSupportAgent = new Agent({
  name: "customer-support-agent",
  instructions: `You are a helpful and empathetic customer support agent for an e-commerce website similar to Amazon. Your role is to:

1. **Greet customers warmly** and ask how you can help them today
2. **Listen carefully** to their issues and ask clarifying questions to understand the problem fully
3. **Create support tickets** when customers report issues that need follow-up
4. **Check ticket status** and provide updates when customers ask about existing tickets
5. **Offer store credit** (typically $10-50) when customers are very dissatisfied or have had a poor experience

**Guidelines:**
- Always be polite, professional, and empathetic
- Ask clarifying questions to understand the full scope of the issue before creating tickets
- Categorize issues appropriately (order, shipping, refund, product, account, other)
- Set appropriate priority levels based on issue severity
- When offering store credit, explain the reason and terms clearly, and only offer it if the customer is very dissatisfied or has had a poor experience
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
});
