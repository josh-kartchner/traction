"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { DueDate } from "./due-date";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "on_hold" | "completed";
  dueDate: string | null;
}

interface TaskItemProps {
  task: Task;
  projectId: string;
  onUpdate: () => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function TaskItem({ task, projectId, onUpdate, isDragging, dragHandleProps }: TaskItemProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      const newStatus = task.status === "completed" ? "not_started" : "completed";
      const response = await fetch("/api/tasks/" + task.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date().toISOString() : null
        }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClick = () => {
    router.push("/projects/" + projectId + "/tasks/" + task.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card p-4 cursor-pointer",
        "shadow-sm transition-all hover:shadow-md active:scale-[0.98]",
        task.status === "completed" && "opacity-60",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-5 h-6 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground touch-none"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
      )}

      {/* Checkbox */}
      <button
        onClick={toggleComplete}
        disabled={isUpdating}
        className={cn(
          "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5",
          task.status === "completed"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 hover:border-primary"
        )}
      >
        {task.status === "completed" && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-medium text-foreground",
            task.status === "completed" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.status !== "completed" && task.status !== "not_started" && (
            <StatusBadge status={task.status} size="sm" />
          )}
          {task.dueDate && (
            <DueDate date={task.dueDate} isCompleted={task.status === "completed"} />
          )}
        </div>
      </div>
    </div>
  );
}
