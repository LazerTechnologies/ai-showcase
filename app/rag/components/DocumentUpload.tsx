"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadDocument } from "../actions/upload-document";

interface DocumentUploadProps {
  namespace: string;
}

export function DocumentUpload({ namespace }: DocumentUploadProps) {
  const [document, setDocument] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleUpload = async () => {
    if (!document.trim()) {
      toast.error("Please enter some document content");
      return;
    }

    if (!namespace.trim()) {
      toast.error("Please set a namespace first");
      return;
    }

    startTransition(async () => {
      try {
        const result = await uploadDocument(namespace.trim(), document.trim());

        if (result.success) {
          toast.success(result.message);
          setDocument(""); // Clear the textarea after successful upload
        } else {
          toast.error(result.error || "Failed to upload document");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload document");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="document-content">Document Content</Label>
        <Textarea
          id="document-content"
          placeholder="Paste your document content here..."
          value={document}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setDocument(e.target.value)
          }
          rows={8}
          className="mt-2 max-h-[400px]"
        />
      </div>

      <Button
        onClick={handleUpload}
        disabled={isPending || !document.trim() || !namespace.trim()}
        className="w-full"
      >
        {isPending ? (
          <>
            Processing...
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            Chunk and upsert document
            <Upload className="mr-2 h-4 w-4" />
          </>
        )}
      </Button>

      {document.trim() && (
        <p className="text-sm text-muted-foreground">
          Document length: {document.length} characters
        </p>
      )}
    </div>
  );
}
