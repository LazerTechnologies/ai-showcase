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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { UseFormReturn } from "react-hook-form";

interface IconButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

function IconButton({
  icon,
  tooltip,
  onClick,
  type = "button",
  disabled = false,
}: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type={type}
          size="icon"
          variant="outline"
          onClick={onClick}
          disabled={disabled}
        >
          {icon}
          <span className="sr-only">{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

interface SingleFieldActionProps {
  additionalIconButtons?: {
    icon: React.ReactNode;
    onClick: (form: UseFormReturn<{ value: string }>) => void;
    tooltip: string;
  }[];
  label: string;
  description: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
  onSubmit: (value: string) => void;
}

export function SingleFieldAction({
  additionalIconButtons,
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
    mode: "onChange",
  });
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  const handleSubmit = (data: { value: string }) => {
    onSubmit(data.value);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex items-end space-x-2"
      >
        <FormField
          {...form.register("value", {
            validate: validate,
          })}
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{label}</FormLabel>
              <FormDescription>{description}</FormDescription>
              <FormControl>
                <Input {...field} placeholder={placeholder} />
              </FormControl>
            </FormItem>
          )}
        />

        {additionalIconButtons && (
          <>
            {additionalIconButtons.map((button) => (
              <IconButton
                key={button.tooltip}
                icon={button.icon}
                tooltip={button.tooltip}
                onClick={() => button.onClick(form)}
              />
            ))}
          </>
        )}

        <IconButton
          icon={<Check className="h-4 w-4" />}
          tooltip={`Save ${label}`}
          type="submit"
          disabled={hasErrors}
        />
      </form>
      {hasErrors && (
        <FormMessage>{form.formState.errors.value?.message}</FormMessage>
      )}
    </Form>
  );
}
