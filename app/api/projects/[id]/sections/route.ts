import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { CreateSectionInput } from "@/lib/types";

// POST /api/projects/[id]/sections - Add a section to a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: Omit<CreateSectionInput, "projectId"> = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Section name is required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get next sort order
    const lastSection = await prisma.section.findFirst({
      where: { projectId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const nextSortOrder = (lastSection?.sortOrder ?? -1) + 1;

    const section = await prisma.section.create({
      data: {
        projectId,
        name: body.name.trim(),
        sortOrder: body.sortOrder ?? nextSortOrder,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
