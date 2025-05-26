"use client";

import * as React from "react";
import { Settings } from "lucide-react";

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

export const USER_ID_STORAGE_KEY = "userId";
export const THREAD_ID_STORAGE_KEY = "threadId";

interface SettingsData {
  userId: string;
  threadId: string;
}

export function SettingsDropdown({ className }: { className?: string }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<SettingsData>(() => ({
    userId:
      typeof window !== "undefined"
        ? localStorage.getItem(USER_ID_STORAGE_KEY) || ""
        : "",
    threadId:
      typeof window !== "undefined"
        ? localStorage.getItem(THREAD_ID_STORAGE_KEY) || ""
        : "",
  }));

  const handleSave = () => {
    localStorage.setItem(USER_ID_STORAGE_KEY, settings.userId);
    localStorage.setItem(THREAD_ID_STORAGE_KEY, settings.threadId);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: keyof SettingsData, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="userId" className="text-sm font-medium">
              User ID
            </label>
            <Input
              id="userId"
              value={settings.userId}
              onChange={(e) => handleInputChange("userId", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="threadId" className="text-sm font-medium">
              Thread ID
            </label>
            <Input
              id="threadId"
              value={settings.threadId}
              onChange={(e) => handleInputChange("threadId", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
