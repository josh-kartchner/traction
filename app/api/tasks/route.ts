import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { CreateTaskInput } from "@/lib/types";

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateTaskInput = await request.json();

    if (!body.sectionId) {
      return NextResponse.json(
        { error: "Section ID is required" },
        { status: 400 }
      );
    }

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Verify section exists
    const section = await prisma.section.findUnique({
      where: { id: body.sectionId },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Get next sort order within section
    const lastTask = await prisma.task.findFirst({
      where: { sectionId: body.sectionId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastTask?.sortOrder ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        sectionId: body.sectionId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        status: body.status || "not_started",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        sortOrder: body.sortOrder ?? nextSortOrder,
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
