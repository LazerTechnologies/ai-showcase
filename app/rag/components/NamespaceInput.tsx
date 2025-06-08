"use client";

import { SingleFieldAction } from "@/app/components/chat/actions/SingleFieldAction";

interface NamespaceInputProps {
  namespace: string;
  onNamespaceChange: (namespace: string) => void;
}

export function NamespaceInput({
  namespace,
  onNamespaceChange,
}: NamespaceInputProps) {
  return (
    <SingleFieldAction
      label="Namespace"
      description="Pinecone namespace for organizing your documents within the ai-showcase index"
      placeholder="Enter namespace (e.g., my-documents)"
      defaultValue={namespace}
      validate={(value) => {
        if (!value.trim()) {
          return "Namespace is required";
        }
        // Pinecone namespace validation (similar to index name but more flexible)
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          return "Namespace must contain only letters, numbers, hyphens, and underscores";
        }
        if (value.length > 100) {
          return "Namespace must be 100 characters or less";
        }
        return undefined;
      }}
      onSubmit={onNamespaceChange}
    />
  );
}
