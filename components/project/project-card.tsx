"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  openTaskCount: number;
}

export function ProjectCard({
  id,
  name,
  description,
  imageUrl,
  openTaskCount,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card p-4",
        "shadow-sm transition-shadow hover:shadow-md",
        "active:scale-[0.98] touch-target"
      )}
    >
      {/* Project Image/Icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          "📁"
        )}
      </div>

      {/* Project Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>

      {/* Task Count Badge */}
      <div className="flex-shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
        {openTaskCount}
      </div>
    </Link>
  );
}
