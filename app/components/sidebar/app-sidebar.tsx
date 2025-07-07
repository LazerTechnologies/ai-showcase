import * as React from "react";
import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Scenario from "./scenario";
import { WipOverlay } from "../../../components/ui/wip-overlay";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="https://www.lazertechnologies.com/" target="_blank">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <MessagesSquare className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">AI agents at Lazer</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-6 gap-4">
        <Scenario
          title="Customer Support Bot"
          description="Intelligent customer service agent with access to knowledge bases, ticketing systems, and escalation protocols."
          path="/customer-support-bot"
          badges={["Tools", "Authorization"]}
        />
        <Scenario
          title="General Chat"
          description="General chat with a model: memory included"
          path="/"
          badges={[]}
        />
        <WipOverlay>
          <Scenario
            title="MCP"
            description="Using Model Context Protocol for seamless AI model communication and context sharing across different systems."
            path="/mcp"
            badges={["MCP", "Protocol", "Context Sharing", "Interoperability"]}
          />
        </WipOverlay>
        <WipOverlay>
          <Scenario
            title="Tool Usage Agent"
            description="Showcase an AI agent that can dynamically select and use various tools like calculators, web scrapers, and APIs."
            path="/tool-usage-agent"
            badges={[
              "Tool Selection",
              "API Integration",
              "Dynamic Execution",
              "Function Calling",
            ]}
          />
        </WipOverlay>
        <Scenario
          title="Authorization"
          description="This chat uses headers to pass authorization data during the request. This is then used to change the system prompt, which tools are available to the model, and configurations to pass to those tools."
          path="/authorization"
          badges={["Authorization", "Tool Selection"]}
        />
        <Scenario
          title="RAG with Pinecone"
          description="Retrieval-Augmented Generation using Pinecone vector database. Upload documents, create embeddings, and chat with your data using semantic search."
          path="/rag"
          badges={["RAG", "Pinecone", "Vector Search", "Document Upload"]}
        />
        <Scenario
          title="Agentic Retrieval"
          description="An agent that chooses between different search methods: name/ID lookup, keyword search, or semantic search to find Google Drive files based on your request."
          path="/agentic-retrieval"
          badges={["RAG", "Vector Search"]}
        />
        <Scenario
          title="Multi-Agent Collaboration"
          description="Multiple AI agents working together to solve complex problems through coordination and task delegation."
          path="/multi-agent-collaboration"
          badges={[
            "Multi-Agent",
            "Coordination",
            "Task Delegation",
            "Distributed AI",
          ]}
        />
        <WipOverlay>
          <Scenario
            title="Code Generation Assistant"
            description="An AI agent specialized in generating, reviewing, and refactoring code across multiple programming languages."
            path="/code-generation-assistant"
            badges={[
              "Code Generation",
              "Code Review",
              "Refactoring",
              "Multi-Language",
            ]}
          />
        </WipOverlay>
        <WipOverlay>
          <Scenario
            title="Data Analysis Pipeline"
            description="Automated data processing agent that can clean, analyze, and visualize datasets with minimal human intervention."
            path="/data-analysis-pipeline"
            badges={[
              "Data Processing",
              "Analytics",
              "Visualization",
              "Automation",
            ]}
          />
        </WipOverlay>
        <WipOverlay>
          <Scenario
            title="Research Assistant"
            description="AI agent that can search, summarize, and synthesize information from multiple sources for research tasks."
            path="/research-assistant"
            badges={[
              "Research",
              "Information Retrieval",
              "Summarization",
              "Synthesis",
            ]}
          />
        </WipOverlay>
      </SidebarContent>

      {/* <SidebarRail />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="https://github.com/LazerTechnologies/ai-agents"
                target="_blank"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Github className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">GitHub</span>
                  <span className="">View Source</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
