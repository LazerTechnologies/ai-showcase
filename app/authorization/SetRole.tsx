"use client";

import { Button } from "@/components/ui/button";

interface SetRoleProps {
  role: "viewer" | "admin";
  setRole: (role: "viewer" | "admin") => void;
}

export function SetRole({ role, setRole }: SetRoleProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold">User Role</h3>
        <p className="text-sm text-muted-foreground">
          Switch between viewer and admin roles
        </p>
      </div>
      <div className="text-sm text-muted-foreground">
        Current role: <span className="font-medium">{role}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant={role === "viewer" ? "default" : "outline"}
          size="sm"
          onClick={() => setRole("viewer")}
        >
          Viewer
        </Button>
        <Button
          variant={role === "admin" ? "default" : "outline"}
          size="sm"
          onClick={() => setRole("admin")}
        >
          Admin
        </Button>
      </div>
    </div>
  );
}
