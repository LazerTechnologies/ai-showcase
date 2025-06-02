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
import { USER_ID_STORAGE_KEY } from "@/app/constants/local-storage";

const userIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

type UserIdData = z.infer<typeof userIdSchema>;

export function SetUserId() {
  const form = useForm<UserIdData>({
    resolver: zodResolver(userIdSchema),
    defaultValues: {
      userId:
        typeof window !== "undefined"
          ? localStorage.getItem(USER_ID_STORAGE_KEY) || ""
          : "",
    },
  });

  const onSubmit = (data: UserIdData) => {
    localStorage.setItem(USER_ID_STORAGE_KEY, data.userId);
    toast.success("User ID saved");
  };

  const isValid = form.watch("userId")?.length > 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-end space-x-2"
      >
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Set user ID</FormLabel>
              <FormDescription>
                Unique identifier for your user account
              </FormDescription>
              <FormControl>
                <Input {...field} placeholder="Enter User ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="icon" variant="outline" disabled={!isValid}>
          <Check className="h-4 w-4" />
          <span className="sr-only">Save User ID</span>
        </Button>
      </form>
    </Form>
  );
}
