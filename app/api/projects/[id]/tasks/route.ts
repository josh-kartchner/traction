import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

// POST /api/projects/[id]/tasks - Create a new task in a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Get the section - either specified or the first section of the project
    let sectionId = body.sectionId;

    if (!sectionId) {
      const firstSection = await prisma.section.findFirst({
        where: { projectId },
        orderBy: { sortOrder: "asc" },
      });

      if (!firstSection) {
        return NextResponse.json(
          { error: "Project has no sections" },
          { status: 400 }
        );
      }

      sectionId = firstSection.id;
    }

    // Get next sort order within the section
    const lastTask = await prisma.task.findFirst({
      where: { sectionId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastTask?.sortOrder ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        sectionId,
        sortOrder: nextSortOrder,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || "not_started",
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
