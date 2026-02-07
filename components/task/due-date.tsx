import { cn } from "@/lib/utils";
import { formatDueDate, isDateToday, isDateOverdue } from "@/lib/date";
import { AlertTriangle } from "lucide-react";

interface DueDateProps {
  date: string;
  compact?: boolean;
  className?: string;
}

export function DueDate({ date, compact = false, className }: DueDateProps) {
  const isToday = isDateToday(date);
  const isOverdue = isDateOverdue(date);
  const label = formatDueDate(date);

  return (
    <span
      className={cn(
        "flex items-center gap-1",
        compact ? "text-[11px]" : "text-xs",
        isOverdue
          ? "text-destructive"
          : isToday
          ? "font-semibold text-primary"
          : "text-muted-foreground",
        className
      )}
    >
      {isOverdue && !compact && <AlertTriangle className="h-3 w-3" />}
      {label}
    </span>
  );
}
