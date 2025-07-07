"use client";

import { SingleFieldAction } from "./SingleFieldAction";
import { THREAD_ID_STORAGE_KEY } from "@/app/constants/local-storage";
import { RefreshCcw } from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

export function SetThreadId() {
  const validateThreadId = (value: string) => {
    if (!value || value.length === 0) {
      return "Thread ID is required";
    }
    return undefined;
  };

  const handleSubmit = (value: string) => {
    localStorage.setItem(THREAD_ID_STORAGE_KEY, value);
    toast.success("Thread ID saved");
  };

  return (
    <SingleFieldAction
      label="Set thread ID"
      description="Unique identifier for the conversation thread"
      defaultValue={
        typeof window !== "undefined"
          ? localStorage.getItem(THREAD_ID_STORAGE_KEY) || ""
          : ""
      }
      validate={validateThreadId}
      onSubmit={handleSubmit}
      additionalIconButtons={[
        {
          icon: <RefreshCcw className="h-4 w-4" />,
          tooltip: "Generate new thread ID",
          onClick: (form) => {
            const newThreadId = nanoid();
            localStorage.setItem(THREAD_ID_STORAGE_KEY, newThreadId);
            form.setValue("value", newThreadId);
            toast.success("New Thread ID generated");
          },
        },
      ]}
    />
  );
}
