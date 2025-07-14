# AI Agents Showcase

A demonstration of AI agent capabilities built with [Mastra](https://mastra.ai/) and Next.js 15, showcasing various agentic patterns including RAG, multi-agent collaboration, MCP, and more.

The project contains a series of scenarios that each have a chat experience as well as a list of actions that can be performed to play around with the data behind the agent.

## 🛠️ Setup

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Pinecone account (for vector search features)
- Google AI API key (for Gemini models)

### Environment Variables

Create a `.env` file with the following variables:

```env
# Google AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key

# PostgreSQL Database
DATABASE_URL=your_postgresql_connection_string
POSTGRES_HOST=your_host
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database_name

# Pinecone (for RAG features)
PINECONE_API_KEY=your_pinecone_api_key
```

### Installation

```bash
# Install dependencies
pnpm install

# Set up the database
pnpm db:push

# Start the development server
pnpm dev
```

The application will be available at `http://localhost:3001`.

## 📚 Implemented Agentic Scenarios

### Memory

All of the following scenarios feature the following:

- Persistent user-based and thread-based memory
- Semantic recall of past messages once conversation length exceeds the configured context window (via vector-based search of past messages)

### 1. General Chat

**Path**: `/`

This is a simple chat to provide a "blank" template for getting started. It features a simple weather tool.

### 2. Customer Support Bot

**Path**: `/customer-support-bot`

This is a customer support experience for an e-commerce use case. It allows users to create and manage support tickets, offer store credit for dissatisfied customers, and track ticket status and history. It uses PostgreSQL for ticket and credit storage.

It demonstrates authorization as well as how to prevent users from coercing the agent to perform actions that are not allowed.

### 3. RAG with Pinecone

**Path**: `/rag`

This RAG experience allows users to upload documents for knowledge base creation, semantic search through document content, and namespace-based organization. By default it has a NextJS 15 changelog as the knowledge base at the namespace `default-namespace`.

### 4. Agentic Retrieval

**Path**: `/agentic-retrieval`

This is agent demonstrates search beyond just RAG. It allows users to search for files in a simulated Google Drive, and the agent will choose the best search method out of name/id lookup, keyword search, and vector search.

### 5. Multi-Agent Collaboration

**Path**: `/multi-agent-collaboration`

This chat demonstrates how to use multiple agents to collaborate on a task. You primarily interact with the `delegate` agent, which will delegate the task to the appropriate agent. In this case, there's a `coder` agent that can write code.

### 6. Authorization

**Path**: `/authorization`

This chat demonstrates how to use authorization via headers to control what tools an agent can use. The tools are modified at query-time based on the user's role rather than relying on the agent to handle any kind of authorization.

### 7. MCP (Model Context Protocol)

**Path**: `/mcp`

This chat demonstrates how to use MCP to integrate with external documentation and tools. It's connected to the Context7 MCP server.

### Agent Framework

Built on Mastra's agent system with:

- **Tools**: Custom and built-in tool integrations
- **Memory**: Persistent conversation memory
- **Models**: Google Gemini 2.5 Flash for text generation
- **Embeddings**: Google text-embedding-004 for vector operations

All of these can be swapped out or reconfigured.

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run ESLint
pnpm ts:check        # TypeScript type checking

# Database
pnpm db:push         # Push schema changes to database
pnpm db:studio       # Open Drizzle Studio
pnpm db:generate     # Generate migration files
pnpm db:migrate      # Run migrations
```

### Project Structure

Each chat page has:

- A chat page
- A set of actions on the page that can be performed to play around with the data behind the agent (implemented by server actions)
- An API route that handles the chat stream
- A Mastra agent which may be fully specified ahead of time or dynamically created at runtime
