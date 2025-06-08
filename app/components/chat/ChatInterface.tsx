"use client";

import { useState } from "react";
import { MessagesContainer } from "./MessagesContainer";
import { ChatInput } from "./ChatInput";
import { StreamMessage } from "@/app/hooks/useDataStream";
import { Message as UIMessage } from "ai";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SetUserId } from "./actions/SetUserId";
import { SetThreadId } from "./actions/SetThreadId";

interface ChatInterfaceProps {
  messages: StreamMessage[] | UIMessage[];
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  title,
  description,
  actions,
}: ChatInterfaceProps) {
  const isMobile = useIsMobile();
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const mobileActionsSheet = (
    <Sheet open={isActionsOpen} onOpenChange={setIsActionsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-fit">
          Open actions
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Actions</SheetTitle>
        </SheetHeader>
        <div className="mt-4">{actions}</div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      <div className="mb-4 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>

        {/* Mobile actions button */}
        {isMobile && actions && mobileActionsSheet}
      </div>

      <div className="flex flex-1 gap-4">
        {/* Main chat area */}
        <div className="flex flex-col flex-1 border rounded-lg overflow-hidden bg-background">
          <MessagesContainer messages={messages} />
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Desktop actions panel */}
        {!isMobile && actions && (
          <div className="w-80 border rounded-lg bg-background p-4">
            <h2 className="text-lg font-semibold mb-6">Actions</h2>
            <div className="flex flex-col gap-5">
              <SetUserId />
              <SetThreadId />
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
