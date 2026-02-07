import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { CreateAttachmentInput } from "@/lib/types";

// POST /api/tasks/[id]/attachments - Add an attachment to a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: Omit<CreateAttachmentInput, "taskId"> = await request.json();

    // Validate required fields
    if (!body.fileName || !body.fileUrl || !body.fileSize || !body.mimeType) {
      return NextResponse.json(
        { error: "Missing required attachment fields" },
        { status: 400 }
      );
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        fileName: body.fileName,
        fileUrl: body.fileUrl,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error creating attachment:", error);
    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 }
    );
  }
}
