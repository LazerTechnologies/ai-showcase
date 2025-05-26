"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const USER_ID_STORAGE_KEY = "userId";
export const THREAD_ID_STORAGE_KEY = "threadId";

const settingsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  threadId: z.string().min(1, "Thread ID is required"),
});

type SettingsData = z.infer<typeof settingsSchema>;

export function SettingsDropdown({ className }: { className?: string }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const form = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      userId:
        typeof window !== "undefined"
          ? localStorage.getItem(USER_ID_STORAGE_KEY) || ""
          : "",
      threadId:
        typeof window !== "undefined"
          ? localStorage.getItem(THREAD_ID_STORAGE_KEY) || ""
          : "",
    },
  });

  const onSubmit = (data: SettingsData) => {
    localStorage.setItem(USER_ID_STORAGE_KEY, data.userId);
    localStorage.setItem(THREAD_ID_STORAGE_KEY, data.threadId);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your user ID and thread ID settings. These will be saved
            to your local storage.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="threadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thread ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
