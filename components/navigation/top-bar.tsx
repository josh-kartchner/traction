"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function TopBar({
  title,
  subtitle,
  backHref,
  onBack,
  rightContent,
  className,
}: TopBarProps) {
  const showBack = backHref || onBack;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-background px-4 py-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            onBack ? (
              <button
                onClick={onBack}
                className="flex items-center justify-center text-primary -ml-1 touch-target"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : (
              <Link
                href={backHref!}
                className="flex items-center justify-center text-primary -ml-1 touch-target"
              >
                <ChevronLeft className="h-6 w-6" />
              </Link>
            )
          )}
          <div>
            <h1 className="text-lg font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
