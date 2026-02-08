"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/navigation/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Section {
  id: string;
  name: string;
}

export default function NewTaskPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [sections, setSections] = useState<Section[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSections() {
      try {
        const response = await fetch("/api/projects/" + projectId);
        if (response.ok) {
          const project = await response.json();
          setSections(project.sections);
          if (project.sections.length > 0) {
            setSectionId(project.sections[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      }
    }
    fetchSections();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/projects/" + projectId + "/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          sectionId,
          dueDate: dueDate || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create task");
      }

      router.push("/projects/" + projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar
        title="New Task"
        backHref={"/projects/" + projectId}
      />

      <main className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              autoFocus
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

          <Button type="submit" disabled={isSubmitting} className="mt-4">
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </main>
    </div>
  );
}
