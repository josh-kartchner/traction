"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function TaskCheckbox({ checked, onChange, className }: TaskCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all touch-target",
        checked
          ? "border-primary bg-primary"
          : "border-gray-300 bg-transparent hover:border-gray-400",
        className
      )}
    >
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </button>
  );
}
