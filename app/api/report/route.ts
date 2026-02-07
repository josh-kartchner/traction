import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

// GET /api/report - Get all tasks grouped by status (cross-project)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all tasks grouped by status
    const tasks = await prisma.task.findMany({
      include: {
        section: {
          include: {
            project: {
              select: { id: true, name: true, isArchived: true },
            },
          },
        },
      },
      orderBy: [
        { section: { project: { name: "asc" } } },
        { sortOrder: "asc" },
      ],
    });

    // Filter out tasks from archived projects and group by status
    const activeTasks = tasks.filter(
      (task) => !task.section.project.isArchived
    );

    const formatTask = (task: typeof tasks[0]) => ({
      ...task,
      dueDate: task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : null,
      projectName: task.section.project.name,
      sectionName: task.section.name,
    });

    const grouped = {
      notStarted: activeTasks
        .filter((t) => t.status === "not_started")
        .map(formatTask),
      inProgress: activeTasks
        .filter((t) => t.status === "in_progress")
        .map(formatTask),
      onHold: activeTasks
        .filter((t) => t.status === "on_hold")
        .map(formatTask),
      completed: activeTasks
        .filter((t) => t.status === "completed")
        .map(formatTask),
    };

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
