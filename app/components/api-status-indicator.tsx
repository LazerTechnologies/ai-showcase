"use client";

import { useQuery } from "@tanstack/react-query";
import { checkGeminiStatus } from "../actions/check-gemini-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TEN_MINUTES = 10 * 60 * 1000;

export function ApiStatusIndicator() {
  const {
    data: status,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gemini-status"],
    queryFn: checkGeminiStatus,
    refetchInterval: TEN_MINUTES,
    retry: false,
  });

  const finalStatus = error
    ? {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    : status;

  if (isLoading) {
    return (
      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse mr-2"></div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex gap-2 items-center mr-2">
            <div
              className={`w-3 h-3 rounded-full ${
                finalStatus?.success ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm hidden md:block">
              {finalStatus?.success ? "Connected" : "Gemini is down"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {finalStatus?.success
            ? "Gemini API is operational"
            : `Gemini API error: ${finalStatus?.error || "Unknown error"}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
