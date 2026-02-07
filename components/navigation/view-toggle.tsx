"use client";

import { cn } from "@/lib/utils";

export type ViewMode = "list" | "board";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "flex gap-0.5 rounded-lg bg-muted p-0.5",
        className
      )}
    >
      {(["list", "board"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition-all",
            view === v
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {v === "board" ? "Board" : "List"}
        </button>
      ))}
    </div>
  );
}
