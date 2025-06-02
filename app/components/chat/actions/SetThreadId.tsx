"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { THREAD_ID_STORAGE_KEY } from "@/app/constants/local-storage";

const threadIdSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
});

type ThreadIdData = z.infer<typeof threadIdSchema>;

export function SetThreadId() {
  const form = useForm<ThreadIdData>({
    resolver: zodResolver(threadIdSchema),
    defaultValues: {
      threadId:
        typeof window !== "undefined"
          ? localStorage.getItem(THREAD_ID_STORAGE_KEY) || ""
          : "",
    },
  });

  const onSubmit = (data: ThreadIdData) => {
    localStorage.setItem(THREAD_ID_STORAGE_KEY, data.threadId);
    toast.success("Thread ID saved");
  };

  const isValid = form.watch("threadId")?.length > 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-end space-x-2"
      >
        <FormField
          control={form.control}
          name="threadId"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Thread ID</FormLabel>
              <FormDescription>
                Unique identifier for the conversation thread
              </FormDescription>
              <FormControl>
                <Input {...field} placeholder="Enter Thread ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="icon" variant="outline" disabled={!isValid}>
          <Check className="h-4 w-4" />
          <span className="sr-only">Save Thread ID</span>
        </Button>
      </form>
    </Form>
  );
}
