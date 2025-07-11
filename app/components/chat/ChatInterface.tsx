"use client";

import { useState, useRef } from "react";
import { MessagesContainer } from "./MessagesContainer";
import { ChatInput } from "./ChatInput";
import { SamplePrompts } from "./SamplePrompts";
import { MultiAgentUIMessage } from "@/app/hooks/useMultiAgentStream";
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
import { EllipsisVertical, Fullscreen, Minimize } from "lucide-react";

interface ChatInterfaceProps {
  messages: MultiAgentUIMessage[] | UIMessage[];
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isResponseLoading: boolean;
  isLoadingInitialMessages?: boolean;
  title: string;
  description: string;
  actions?: React.ReactNode;
  samplePrompts?: string[];
  setInput: (value: string) => void;
  isSingleAgent?: boolean;
}

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isResponseLoading,
  isLoadingInitialMessages,
  title,
  description,
  actions,
  samplePrompts,
  setInput,
  isSingleAgent,
}: ChatInterfaceProps) {
  const isMobile = useIsMobile();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenEnabled = isMobile && isFullscreen;
  const formRef = useRef<HTMLFormElement>(null);

  const actionsToShow = (
    <>
      <SetUserId />
      <SetThreadId />
      {actions}
    </>
  );

  const mobileActionsSheet = (
    <Sheet open={isActionsOpen} onOpenChange={setIsActionsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <EllipsisVertical className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Actions</SheetTitle>
        </SheetHeader>
        <div className="p-4 flex flex-col gap-5">{actionsToShow}</div>
      </SheetContent>
    </Sheet>
  );

  const mobileTopBar = (
    <div className="flex items-center justify-end p-2 border-b sticky top-0">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Fullscreen className="w-4 h-4" />
          )}
        </Button>
        {mobileActionsSheet}
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-col h-full gap-2 ${
        fullscreenEnabled
          ? "fixed inset-0 z-50 bg-background p-2 max-w-none"
          : "max-w-6xl mx-auto"
      }`}
    >
      {!fullscreenEnabled && (
        <div className="mb-4 flex flex-col gap-2">
          <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {description}
          </p>
        </div>
      )}

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Main chat area */}
        <div className="flex flex-col flex-1 border rounded-lg bg-background min-w-0 relative">
          {isMobile && mobileTopBar}

          {isLoadingInitialMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse">
                Loading previous messages...
              </p>
            </div>
          ) : (
            <MessagesContainer
              messages={messages}
              isSingleAgent={isSingleAgent}
              isResponseLoading={isResponseLoading}
            />
          )}
          <SamplePrompts
            samplePrompts={samplePrompts || []}
            setInput={setInput}
            onSubmit={() => formRef.current?.requestSubmit()}
          />
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            formRef={formRef}
          />
        </div>

        {/* Desktop actions panel */}
        <div className="w-80 border rounded-lg bg-background p-4 hidden md:block">
          <h2 className="text-lg font-semibold mb-6">Actions</h2>
          <div className="flex flex-col gap-5">{actionsToShow}</div>
        </div>
      </div>
    </div>
  );
}
