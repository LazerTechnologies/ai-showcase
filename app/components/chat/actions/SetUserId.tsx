"use client";

import { SingleFieldAction } from "./SingleFieldAction";
import { USER_ID_STORAGE_KEY } from "@/app/constants/local-storage";
import { toast } from "sonner";

export function SetUserId() {
  const validateUserId = (value: string) => {
    if (!value || value.length === 0) {
      return "User ID is required";
    }
    return undefined;
  };

  const handleSubmit = (value: string) => {
    localStorage.setItem(USER_ID_STORAGE_KEY, value);
    toast.success("User ID saved");
  };

  return (
    <SingleFieldAction
      label="Set user ID"
      description="Unique identifier for your user account"
      defaultValue={
        typeof window !== "undefined"
          ? localStorage.getItem(USER_ID_STORAGE_KEY) || ""
          : ""
      }
      validate={validateUserId}
      onSubmit={handleSubmit}
    />
  );
}
