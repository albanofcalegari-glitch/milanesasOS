"use client";

import { logout } from "@/actions/auth";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

export function UserMenu({
  userName,
  userEmail,
  userRole,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="size-3.5 text-primary" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-medium">{userName}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{userRole}</p>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-xl shadow-lg z-50 p-2">
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <LogOut className="size-4" />
              Cerrar sesion
            </button>
          </div>
        </>
      )}
    </div>
  );
}
