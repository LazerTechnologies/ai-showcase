"use client";

import { SingleFieldAction } from "./SingleFieldAction";
import { THREAD_ID_STORAGE_KEY } from "@/app/constants/local-storage";
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
    />
  );
}
