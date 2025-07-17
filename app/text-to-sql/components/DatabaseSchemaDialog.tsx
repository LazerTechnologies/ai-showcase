"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Database } from "lucide-react";
import { getDatabaseSchemaAction } from "../actions/get-database-schema";
import { TableRow } from "./TableRow";

export function DatabaseSchemaDialog() {
  const [open, setOpen] = useState(false);

  const {
    data: schema,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["database-schema"],
    queryFn: () => getDatabaseSchemaAction(),
    enabled: open, // Only fetch when dialog is opened
    staleTime: 1 * 24 * 60 * 60 * 1000, // Consider data fresh for 1 day
    gcTime: 1 * 24 * 60 * 60 * 1000, // Keep in cache for 1 day
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Database size={16} />
          View Database Schema
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={20} />
            Database Schema
          </DialogTitle>
          <DialogDescription>
            Explore the structure of your database tables, columns, and
            relationships.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading schema...</span>
            </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              Error loading schema:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </div>
          )}

          {schema &&
            Object.values(schema).map((table) => (
              <TableRow key={table.name} table={table} />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
