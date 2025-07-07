"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  formRef,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1);
  };

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex gap-2 p-4 border-t bg-background"
    >
      <Input
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message"
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
        <Send size={16} />
      </Button>
    </form>
  );
}
