"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/navigation/top-bar";
import { BottomTabs } from "@/components/navigation/bottom-tabs";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "on_hold" | "completed";
  dueDate: string | null;
  projectId: string;
  projectName: string;
  sectionName: string;
}

interface TaskGroups {
  overdue: Task[];
  dueToday: Task[];
  dueTomorrow: Task[];
  upcoming: Task[];
  noDueDate: Task[];
}

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  variant?: "overdue" | "today" | "tomorrow" | "upcoming" | "no-date";
  onTaskClick: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

function TaskSection({ title, tasks, variant = "upcoming", onTaskClick, onToggleComplete }: TaskSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (tasks.length === 0) return null;

  const headerColors = {
    overdue: "text-destructive",
    today: "text-primary",
    tomorrow: "text-foreground",
    upcoming: "text-muted-foreground",
    "no-date": "text-muted-foreground",
  };

  return (
    <section>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sticky top-[52px] z-20 flex w-full items-center justify-between border-b bg-muted/50 px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs text-muted-foreground transition-transform",
              isCollapsed && "-rotate-90"
            )}
          >
            ▼
          </span>
          <span className={cn("text-xs font-bold uppercase tracking-wider", headerColors[variant])}>
            {title}
          </span>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {tasks.length}
        </span>
      </button>

      {!isCollapsed && (
        <div className="divide-y">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              variant={variant}
              onClick={() => onTaskClick(task)}
              onToggleComplete={() => onToggleComplete(task)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface TaskRowProps {
  task: Task;
  variant: "overdue" | "today" | "tomorrow" | "upcoming" | "no-date";
  onClick: () => void;
  onToggleComplete: () => void;
}

function TaskRow({ task, variant, onClick, onToggleComplete }: TaskRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    await onToggleComplete();
    setIsUpdating(false);
  };

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 active:bg-muted/50"
    >
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5",
          "border-muted-foreground/30 hover:border-primary"
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{task.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {task.projectName}
          {task.dueDate && variant !== "today" && variant !== "overdue" && (
            <span className="ml-1">
              · {formatDate(task.dueDate)}
            </span>
          )}
        </p>
      </div>
      {variant === "overdue" && task.dueDate && (
        <span className="text-xs text-destructive font-medium flex-shrink-0">
          {formatDate(task.dueDate)}
        </span>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < -1) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else if (diffDays === -1) {
    return "Yesterday";
  } else if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export default function MyTasksPage() {
  const router = useRouter();
  const [taskGroups, setTaskGroups] = useState<TaskGroups>({
    overdue: [],
    dueToday: [],
    dueTomorrow: [],
    upcoming: [],
    noDueDate: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/my-tasks");

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTaskGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskClick = (task: Task) => {
    router.push("/projects/" + task.projectId + "/tasks/" + task.id);
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const response = await fetch("/api/tasks/" + task.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const totalTasks =
    taskGroups.overdue.length +
    taskGroups.dueToday.length +
    taskGroups.dueTomorrow.length +
    taskGroups.upcoming.length +
    taskGroups.noDueDate.length;

  const urgentCount = taskGroups.overdue.length + taskGroups.dueToday.length;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-14">
      <TopBar
        title="My Tasks"
        subtitle={
          isLoading
            ? "Loading..."
            : totalTasks === 0
            ? "All caught up!"
            : urgentCount > 0
            ? urgentCount + " due today or overdue"
            : totalTasks + " task" + (totalTasks !== 1 ? "s" : "")
        }
      />

      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="mb-2 text-lg font-semibold text-destructive">
              Error loading tasks
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchTasks}
              className="text-sm text-primary font-medium"
            >
              Try again
            </button>
          </div>
        ) : totalTasks === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="mb-4 text-5xl">✨</div>
            <h2 className="mb-2 text-lg font-semibold">All caught up!</h2>
            <p className="text-sm text-muted-foreground">
              No tasks to show. Create tasks in your projects.
            </p>
          </div>
        ) : (
          <>
            <TaskSection
              title="Overdue"
              tasks={taskGroups.overdue}
              variant="overdue"
              onTaskClick={handleTaskClick}
              onToggleComplete={handleToggleComplete}
            />
            <TaskSection
              title="Today"
              tasks={taskGroups.dueToday}
              variant="today"
              onTaskClick={handleTaskClick}
              onToggleComplete={handleToggleComplete}
            />
            <TaskSection
              title="Tomorrow"
              tasks={taskGroups.dueTomorrow}
              variant="tomorrow"
              onTaskClick={handleTaskClick}
              onToggleComplete={handleToggleComplete}
            />
            <TaskSection
              title="Upcoming"
              tasks={taskGroups.upcoming}
              variant="upcoming"
              onTaskClick={handleTaskClick}
              onToggleComplete={handleToggleComplete}
            />
            <TaskSection
              title="No Due Date"
              tasks={taskGroups.noDueDate}
              variant="no-date"
              onTaskClick={handleTaskClick}
              onToggleComplete={handleToggleComplete}
            />
          </>
        )}
      </main>

      <BottomTabs />
    </div>
  );
}
