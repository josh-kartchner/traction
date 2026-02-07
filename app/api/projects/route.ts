import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { CreateProjectInput } from "@/lib/types";

// GET /api/projects - List all active projects
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { isArchived: false },
      include: {
        sections: {
          include: {
            tasks: {
              where: { status: { not: "completed" } },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Transform to include openTaskCount
    const projectsWithCounts = projects.map((project) => ({
      ...project,
      openTaskCount: project.sections.reduce(
        (sum, section) => sum + section.tasks.length,
        0
      ),
      sections: undefined, // Remove sections from response
    }));

    return NextResponse.json(projectsWithCounts);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateProjectInput = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Get next sort order
    const lastProject = await prisma.project.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastProject?.sortOrder ?? -1) + 1;

    // Create project with default sections
    const project = await prisma.project.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        imageUrl: body.imageUrl || null,
        sortOrder: nextSortOrder,
        sections: {
          create: [
            { name: "To Do", sortOrder: 0 },
            { name: "In Progress", sortOrder: 1 },
            { name: "Done", sortOrder: 2 },
          ],
        },
      },
      include: {
        sections: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
