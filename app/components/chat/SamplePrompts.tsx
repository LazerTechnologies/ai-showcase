"use client";

import { Button } from "@/components/ui/button";

interface SamplePromptsProps {
  samplePrompts: string[];
  setInput: (value: string) => void;
  onSubmit: () => void;
}

export function SamplePrompts({
  samplePrompts,
  setInput,
  onSubmit,
}: SamplePromptsProps) {
  if (!samplePrompts || samplePrompts.length === 0) {
    return null;
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      onSubmit();
    }, 1);
  };

  return (
    <div className="px-4 py-2 border-t">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full md:justify-center">
        {samplePrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="whitespace-nowrap rounded-full px-4 py-2 text-xs md:text-sm flex-shrink-0"
            onClick={() => handlePromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
