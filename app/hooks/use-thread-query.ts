"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchThread } from "@/app/actions/fetch-thread";
import {
  THREAD_ID_STORAGE_KEY,
  USER_ID_STORAGE_KEY,
} from "@/app/constants/local-storage";
import { getPrefixedThreadId } from "@/app/utils/message-utils";

export function useThreadQuery(threadPrefix: string) {
  const [userId, setUserId] = useState<string | null>(null);
  const [prefixedThreadId, setPrefixedThreadId] = useState<string | null>(null);

  useEffect(() => {
    const updateState = () => {
      setUserId(localStorage.getItem(USER_ID_STORAGE_KEY));
      setPrefixedThreadId(getPrefixedThreadId(threadPrefix));
    };

    updateState();

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === USER_ID_STORAGE_KEY ||
        event.key === THREAD_ID_STORAGE_KEY
      ) {
        updateState();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [threadPrefix]);

  const query = useQuery({
    queryKey: ["thread", prefixedThreadId, userId],
    queryFn: async () => {
      if (!prefixedThreadId || !userId) {
        return null;
      }
      const thread = await fetchThread(prefixedThreadId, userId);
      return thread;
    },
    enabled: !!prefixedThreadId && !!userId,
  });

  return query;
}
