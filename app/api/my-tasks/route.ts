import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getTodayDateString } from "@/lib/date";
import { format } from "date-fns";

// GET /api/my-tasks - Get tasks for My Tasks view (due today + upcoming)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = getTodayDateString();
    const today = new Date(todayStr);

    // Fetch tasks due today or overdue (incomplete only)
    const dueTodayTasks = await prisma.task.findMany({
      where: {
        status: { not: "completed" },
        dueDate: { lte: today },
      },
      include: {
        section: {
          include: {
            project: true,
          },
        },
      },
      orderBy: [
        { dueDate: "asc" },
        { section: { project: { name: "asc" } } },
        { sortOrder: "asc" },
      ],
    });

    // Fetch upcoming tasks (due after today, incomplete only)
    const upcomingTasks = await prisma.task.findMany({
      where: {
        status: { not: "completed" },
        dueDate: { gt: today },
      },
      include: {
        section: {
          include: {
            project: true,
          },
        },
      },
      orderBy: [
        { dueDate: "asc" },
        { section: { project: { name: "asc" } } },
        { sortOrder: "asc" },
      ],
    });

    // Transform tasks to include formatted date strings
    const formatTask = (task: typeof dueTodayTasks[0]) => ({
      ...task,
      dueDate: task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : null,
      projectName: task.section.project.name,
      sectionName: task.section.name,
    });

    return NextResponse.json({
      dueToday: dueTodayTasks.map(formatTask),
      upcoming: upcomingTasks.map(formatTask),
    });
  } catch (error) {
    console.error("Error fetching my tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
