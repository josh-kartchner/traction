import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { addDays, parseISO, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const APP_TIMEZONE = "America/Chicago";

function getTodayDateStringCST(): string {
  return formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd");
}

// Format a database DATE field as yyyy-MM-dd (use UTC since DATE has no timezone)
function formatDateUTC(date: Date): string {
  return formatInTimeZone(date, "UTC", "yyyy-MM-dd");
}

// GET /api/my-tasks - Get all incomplete tasks grouped by due date
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date string in CST
    const todayStr = getTodayDateStringCST();
    const todayDate = parseISO(todayStr);
    const tomorrowStr = format(addDays(todayDate, 1), "yyyy-MM-dd");
    const dayAfterTomorrowStr = format(addDays(todayDate, 2), "yyyy-MM-dd");

    // Fetch all incomplete tasks
    const allTasks = await prisma.task.findMany({
      where: {
        status: { not: "completed" },
      },
      include: {
        section: {
          include: {
            project: true,
          },
        },
      },
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { sortOrder: "asc" },
      ],
    });

    // Transform and group tasks
    const formatTask = (task: typeof allTasks[0]) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? formatDateUTC(task.dueDate) : null,
      sortOrder: task.sortOrder,
      sectionId: task.sectionId,
      projectId: task.section.project.id,
      projectName: task.section.project.name,
      sectionName: task.section.name,
    });

    const overdue: ReturnType<typeof formatTask>[] = [];
    const dueToday: ReturnType<typeof formatTask>[] = [];
    const dueTomorrow: ReturnType<typeof formatTask>[] = [];
    const upcoming: ReturnType<typeof formatTask>[] = [];
    const noDueDate: ReturnType<typeof formatTask>[] = [];

    for (const task of allTasks) {
      const formatted = formatTask(task);

      if (!task.dueDate) {
        noDueDate.push(formatted);
      } else {
        // Compare date strings to avoid timezone issues (use UTC for DB dates)
        const taskDateStr = formatDateUTC(task.dueDate);

        if (taskDateStr < todayStr) {
          overdue.push(formatted);
        } else if (taskDateStr === todayStr) {
          dueToday.push(formatted);
        } else if (taskDateStr === tomorrowStr) {
          dueTomorrow.push(formatted);
        } else {
          upcoming.push(formatted);
        }
      }
    }

    return NextResponse.json({
      overdue,
      dueToday,
      dueTomorrow,
      upcoming,
      noDueDate,
    });
  } catch (error) {
    console.error("Error fetching my tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
