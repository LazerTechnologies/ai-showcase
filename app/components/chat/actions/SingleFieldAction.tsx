"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";

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

interface SingleFieldActionProps {
  label: string;
  description: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
  onSubmit: (value: string) => void;
}

export function SingleFieldAction({
  label,
  description,
  placeholder,
  defaultValue = "",
  validate,
  onSubmit,
}: SingleFieldActionProps) {
  const form = useForm<{ value: string }>({
    defaultValues: {
      value: defaultValue,
    },
  });

  const handleSubmit = (data: { value: string }) => {
    onSubmit(data.value);
  };

  const currentValue = form.watch("value");
  const isValid = currentValue?.length > 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex items-end space-x-2"
      >
        <FormField
          control={form.control}
          name="value"
          rules={{
            validate: validate,
          }}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{label}</FormLabel>
              <FormDescription>{description}</FormDescription>
              <FormControl>
                <Input {...field} placeholder={placeholder} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="icon" variant="outline" disabled={!isValid}>
          <Check className="h-4 w-4" />
          <span className="sr-only">Save {label}</span>
        </Button>
      </form>
    </Form>
  );
}
