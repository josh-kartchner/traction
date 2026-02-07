import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { UpdateSectionInput } from "@/lib/types";

// PATCH /api/sections/[id] - Update section
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateSectionInput = await request.json();

    const section = await prisma.section.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

// DELETE /api/sections/[id] - Delete section (requires task reassignment)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if section has tasks
    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        tasks: { select: { id: true } },
        project: {
          include: {
            sections: { select: { id: true } },
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Prevent deleting the last section
    if (section.project.sections.length <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last section in a project" },
        { status: 400 }
      );
    }

    // If section has tasks, require reassignment
    if (section.tasks.length > 0) {
      const targetSectionId = request.nextUrl.searchParams.get(
        "reassignTo"
      );

      if (!targetSectionId) {
        return NextResponse.json(
          {
            error: "Section has tasks. Provide reassignTo parameter",
            taskCount: section.tasks.length,
          },
          { status: 400 }
        );
      }

      // Move tasks to target section
      await prisma.task.updateMany({
        where: { sectionId: id },
        data: { sectionId: targetSectionId },
      });
    }

    // Delete the section
    await prisma.section.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
