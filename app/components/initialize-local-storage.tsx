"use client";

import { useEffect } from "react";
import { nanoid } from "nanoid";
import {
  THREAD_ID_STORAGE_KEY,
  USER_ID_STORAGE_KEY,
} from "../constants/local-storage";

export const InitializeLocalStorage = () => {
  useEffect(() => {
    if (localStorage.getItem(USER_ID_STORAGE_KEY) === null) {
      localStorage.setItem(USER_ID_STORAGE_KEY, nanoid());
    }
    if (localStorage.getItem(THREAD_ID_STORAGE_KEY) === null) {
      localStorage.setItem(THREAD_ID_STORAGE_KEY, nanoid());
    }
  }, []);

  return null;
};
