"use client";

import { useEffect, useState } from "react";
import { checkGeminiStatus } from "../actions/check-gemini-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiStatus {
  success: boolean;
  error?: string;
}

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkApiStatus = async () => {
      setIsLoading(true);

      try {
        // Check the API status
        const result = await checkGeminiStatus();
        setStatus(result);
      } catch (error) {
        console.error("Error checking API status:", error);
        setStatus({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();
  }, []);

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
                status?.success ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm">
              {status?.success ? "Connected" : "Gemini is down"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status?.success
            ? "Gemini API is operational"
            : `Gemini API error: ${status?.error || "Unknown error"}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
