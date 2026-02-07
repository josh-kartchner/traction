"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface FABProps {
  onClick: () => void;
  className?: string;
}

export function FAB({ onClick, className }: FABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95",
        "hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      style={{
        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
      }}
    >
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </button>
  );
}
