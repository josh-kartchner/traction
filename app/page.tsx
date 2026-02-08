"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/navigation/top-bar";
import { BottomTabs } from "@/components/navigation/bottom-tabs";
import { FAB } from "@/components/ui/fab";
import { ProjectCard } from "@/components/project/project-card";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";

interface Project {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  openTaskCount: number;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/projects");

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-14">
      <TopBar
        title="Traction"
        subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
      />

      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="mb-2 text-lg font-semibold text-destructive">
              Error loading projects
            </h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchProjects}
              className="text-sm text-primary font-medium"
            >
              Try again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">📋</div>
            <h2 className="mb-2 text-lg font-semibold">No projects yet</h2>
            <p className="text-sm text-muted-foreground">
              Create your first project to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                imageUrl={project.imageUrl}
                openTaskCount={project.openTaskCount}
              />
            ))}
          </div>
        )}
      </main>

      <FAB onClick={() => setIsCreateOpen(true)} />

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchProjects}
      />

      <BottomTabs />
    </div>
  );
}
