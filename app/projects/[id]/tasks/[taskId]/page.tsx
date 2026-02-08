"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Section {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "on_hold" | "completed";
  dueDate: string | null;
  sectionId: string;
  section: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
      sections: Section[];
    };
  };
}

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const projectId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("not_started");
  const [sectionId, setSectionId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchTask = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/tasks/" + taskId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Task not found");
        }
        throw new Error("Failed to fetch task");
      }

      const data: Task = await response.json();
      setTitle(data.title);
      setDescription(data.description || "");
      setStatus(data.status);
      setSectionId(data.sectionId);
      setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
      setSections(data.section.project.sections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          sectionId,
          dueDate: dueDate || null,
          completedAt: status === "completed" ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save task");
      }

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch("/api/tasks/" + taskId, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const goBack = () => router.back();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar title="Task" onBack={goBack} />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar title="Error" onBack={goBack} />
        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
          <div className="mb-4 text-5xl">⚠️</div>
          <h2 className="mb-2 text-lg font-semibold text-destructive">
            {error}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar title="Edit Task" onBack={goBack} />

      <main className="flex-1 p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="section" className="text-sm font-medium">
              Section
            </label>
            <select
              id="section"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="dueDate" className="text-sm font-medium">
              Due Date (optional)
            </label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isSaving} className="mt-4">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            Delete Task
          </Button>
        </form>
      </main>
    </div>
  );
}
