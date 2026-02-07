import { createClient } from "./client";

const BUCKET_NAME = "attachments";
const PROJECT_IMAGES_BUCKET = "project-images";

export async function uploadFile(
  file: File,
  path: string,
  bucket: string = BUCKET_NAME
): Promise<{ url: string; error: Error | null }> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { url: "", error: new Error(error.message) };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}

export async function uploadProjectImage(
  file: File,
  projectId: string
): Promise<{ url: string; error: Error | null }> {
  const ext = file.name.split(".").pop();
  const path = `${projectId}/cover.${ext}`;
  return uploadFile(file, path, PROJECT_IMAGES_BUCKET);
}

export async function uploadTaskAttachment(
  file: File,
  taskId: string
): Promise<{ url: string; error: Error | null }> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${taskId}/${timestamp}-${sanitizedName}`;
  return uploadFile(file, path, BUCKET_NAME);
}

export async function deleteFile(
  path: string,
  bucket: string = BUCKET_NAME
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

// Max file sizes from PRD
export const MAX_PROJECT_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
