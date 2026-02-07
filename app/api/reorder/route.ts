import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { ReorderInput } from "@/lib/types";

// PATCH /api/reorder - Batch update sort_order for tasks/sections/projects
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ReorderInput = await request.json();

    if (!body.type || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Invalid reorder request" },
        { status: 400 }
      );
    }

    // Perform batch update based on type
    const updates = body.items.map((item) => {
      switch (body.type) {
        case "projects":
          return prisma.project.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          });
        case "sections":
          return prisma.section.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          });
        case "tasks":
          return prisma.task.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          });
        default:
          throw new Error(`Unknown type: ${body.type}`);
      }
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering:", error);
    return NextResponse.json(
      { error: "Failed to reorder items" },
      { status: 500 }
    );
  }
}
