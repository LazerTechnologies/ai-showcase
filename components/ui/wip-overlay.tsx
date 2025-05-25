import * as React from "react";
import { cn } from "@/lib/utils";

interface WipOverlayProps {
  children: React.ReactNode;
  className?: string;
}

export function WipOverlay({ children, className }: WipOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-lg">
        <div className="bg-muted/90 px-4 py-2 rounded-md border">
          <span className="text-sm font-medium text-muted-foreground">WIP</span>
        </div>
      </div>
    </div>
  );
}
