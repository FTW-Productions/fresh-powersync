import { Attachment } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";
import { decode } from "base64-arraybuffer";

const endpoint = `${process.env.EXPO_PUBLIC_API_URL}/attachments`;

export async function createAttachment(attachment: Attachment) {
  try {
    // Create an arraybuffer from the file
    const file = new File(attachment.local_path!).base64Sync();

    // No need to over-complicate the file name
    const filepath = `image-picker/${attachment.id}.jpg`;

    // Upload the image to supabase
    const { data, error } = await supabase.storage
      .from(process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET)
      .upload(filepath, decode(file), {
        contentType: "image/jpeg",
        upsert: true, //Allow upserts in case we have a failure AFTER this step
      });

    // Get supbase path
    if (error) throw error;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Do a little type juggling...
      body: JSON.stringify({
        ...attachment,
        path: filepath,
        createdBy: attachment.created_by,
        createdAt: new Date(attachment.created_at!).toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create attachment");
    }

    return response.json();
  } catch (error) {
    console.error(
      "Error uploading image to supabase and/or calling attachment API endpoing.",
      error
    );
    throw error;
  }
}
