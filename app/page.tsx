"use client";

import { TopBar } from "@/components/navigation/top-bar";
import { BottomTabs } from "@/components/navigation/bottom-tabs";
import { FAB } from "@/components/ui/fab";

export default function HomePage() {
  // TODO: Fetch projects from API
  const projects: never[] = [];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-14">
      <TopBar
        title="Traction"
        subtitle={`${projects.length} projects`}
      />

      <main className="flex-1 p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">📋</div>
            <h2 className="mb-2 text-lg font-semibold">No projects yet</h2>
            <p className="text-sm text-muted-foreground">
              Create your first project to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Project cards will be rendered here */}
          </div>
        )}
      </main>

      {/* TODO: Wire up FAB to create project modal */}
      <FAB onClick={() => console.log("Create project")} />
      <BottomTabs />
    </div>
  );
}
