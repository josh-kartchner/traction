"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TopBar } from "@/components/navigation/top-bar";
import { BottomTabs } from "@/components/navigation/bottom-tabs";
import { FAB } from "@/components/ui/fab";
import { TaskItem } from "@/components/task/task-item";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "on_hold" | "completed";
  dueDate: string | null;
  sortOrder: number;
  sectionId?: string;
}

interface Section {
  id: string;
  name: string;
  sortOrder: number;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  sections: Section[];
}

function SortableTaskItem({
  task,
  projectId,
  onUpdate,
}: {
  task: Task;
  projectId: string;
  onUpdate: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        projectId={projectId}
        onUpdate={onUpdate}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function DroppableSection({
  section,
  projectId,
  onUpdate,
  isOver,
}: {
  section: Section;
  projectId: string;
  onUpdate: () => void;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: section.id,
    data: { type: "section", section },
  });

  return (
    <div ref={setNodeRef}>
      <SortableContext
        items={section.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {section.tasks.length === 0 ? (
          <div
            className={
              "rounded-xl border-2 border-dashed p-4 text-center transition-colors " +
              (isOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20")
            }
          >
            <p className="text-sm text-muted-foreground/60">
              {isOver ? "Drop here" : "No tasks"}
            </p>
          </div>
        ) : (
          <div
            className={
              "flex flex-col gap-2 rounded-xl p-1 transition-colors " +
              (isOver ? "bg-primary/5" : "")
            }
          >
            {section.tasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                projectId={projectId}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchProject = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/projects/" + projectId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Project not found");
        }
        throw new Error("Failed to fetch project");
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const findSectionByTaskId = (taskId: string): Section | undefined => {
    return project?.sections.find((s) => s.tasks.some((t) => t.id === taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = project?.sections
      .flatMap((s) => s.tasks)
      .find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverSectionId(null);
      return;
    }

    // Check if over a section directly
    const section = project?.sections.find((s) => s.id === over.id);
    if (section) {
      setOverSectionId(section.id);
      return;
    }

    // Check if over a task - find its section
    const taskSection = findSectionByTaskId(over.id as string);
    if (taskSection) {
      setOverSectionId(taskSection.id);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverSectionId(null);

    if (!over || !project) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find source section
    const sourceSection = findSectionByTaskId(activeTaskId);
    if (!sourceSection) return;

    // Determine destination section
    let destSection = project.sections.find((s) => s.id === overId);
    if (!destSection) {
      destSection = findSectionByTaskId(overId);
    }
    if (!destSection) return;

    const activeTaskData = sourceSection.tasks.find((t) => t.id === activeTaskId);
    if (!activeTaskData) return;

    // If same section and same position, do nothing
    if (sourceSection.id === destSection.id) {
      const oldIndex = sourceSection.tasks.findIndex((t) => t.id === activeTaskId);
      const newIndex = sourceSection.tasks.findIndex((t) => t.id === overId);
      if (oldIndex === newIndex) return;
    }

    // Optimistically update UI
    const newSections = project.sections.map((section) => ({
      ...section,
      tasks: [...section.tasks],
    }));

    const sourceSectionIndex = newSections.findIndex(
      (s) => s.id === sourceSection.id
    );
    const destSectionIndex = newSections.findIndex(
      (s) => s.id === destSection!.id
    );

    // Remove from source
    const taskIndex = newSections[sourceSectionIndex].tasks.findIndex(
      (t) => t.id === activeTaskId
    );
    const [movedTask] = newSections[sourceSectionIndex].tasks.splice(taskIndex, 1);

    // Add to destination
    if (sourceSection.id === destSection.id) {
      // Same section - reorder
      const overIndex = newSections[destSectionIndex].tasks.findIndex(
        (t) => t.id === overId
      );
      newSections[destSectionIndex].tasks.splice(
        overIndex >= 0 ? overIndex : newSections[destSectionIndex].tasks.length,
        0,
        movedTask
      );
    } else {
      // Different section
      const overIndex = newSections[destSectionIndex].tasks.findIndex(
        (t) => t.id === overId
      );
      if (overIndex >= 0) {
        newSections[destSectionIndex].tasks.splice(overIndex, 0, movedTask);
      } else {
        newSections[destSectionIndex].tasks.push(movedTask);
      }
    }

    setProject({ ...project, sections: newSections });

    // Update on server
    try {
      await fetch("/api/tasks/" + activeTaskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: destSection.id,
        }),
      });
    } catch (error) {
      console.error("Failed to move task:", error);
      fetchProject();
    }
  };

  const totalTasks =
    project?.sections.reduce((sum, section) => sum + section.tasks.length, 0) ??
    0;

  const openTasks =
    project?.sections.reduce(
      (sum, section) =>
        sum + section.tasks.filter((t) => t.status !== "completed").length,
      0
    ) ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-14">
      <TopBar
        title={project?.name ?? "Loading..."}
        subtitle={
          project
            ? openTasks + " open task" + (openTasks !== 1 ? "s" : "")
            : undefined
        }
        backHref="/"
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
              {error}
            </h2>
            <Link href="/" className="text-sm text-primary font-medium">
              Go back to projects
            </Link>
          </div>
        ) : project && totalTasks === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">✨</div>
            <h2 className="mb-2 text-lg font-semibold">No tasks yet</h2>
            <p className="text-sm text-muted-foreground">
              Add your first task to get started
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-6">
              {project?.sections.map((section) => (
                <div key={section.id}>
                  <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {section.name}
                    {section.tasks.length > 0 && (
                      <span className="ml-2 text-xs font-normal">
                        ({section.tasks.length})
                      </span>
                    )}
                  </h2>
                  <DroppableSection
                    section={section}
                    projectId={projectId}
                    onUpdate={fetchProject}
                    isOver={overSectionId === section.id}
                  />
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="opacity-90 rotate-2">
                  <TaskItem
                    task={activeTask}
                    projectId={projectId}
                    onUpdate={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <FAB onClick={() => router.push("/projects/" + projectId + "/tasks/new")} />

      <BottomTabs />
    </div>
  );
}
