"use client";

import { useMutation } from "@tanstack/react-query";
import { checkModelStatus } from "../actions/check-model-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ApiStatusIndicator() {
  const {
    mutate,
    data: status,
    isPending,
    error,
  } = useMutation({
    mutationFn: checkModelStatus,
    retry: false,
  });

  const finalStatus = error
    ? {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    : status;

  const handleClick = () => {
    if (!isPending) {
      mutate();
    }
  };

  if (!status && !error && !isPending) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className="flex gap-2 items-center mr-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-3 h-3 rounded-full bg-current"></div>
              <span className="text-sm hidden md:block">Check API status</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Click to check model API status</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isPending) {
    return (
      <div className="flex gap-2 items-center mr-2 pointer-events-none opacity-60">
        <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
        <span className="text-sm hidden md:block">Checking...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="flex gap-2 items-center mr-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div
              className={`w-3 h-3 rounded-full ${
                finalStatus?.success ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm hidden md:block">
              {finalStatus?.success ? "Connected" : "Model is down"}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {finalStatus?.success
            ? "Model API is operational"
            : `Model API error: ${finalStatus?.error || "Unknown error"}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
