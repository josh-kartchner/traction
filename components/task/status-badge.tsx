import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type StatusKey } from "@/lib/types";

interface StatusBadgeProps {
  status: StatusKey;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        className
      )}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
      }}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </span>
  );
}
