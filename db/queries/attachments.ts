import { dbForApp } from "@/powersync/system";
import { attachments, Attachment } from "@/db/schema";

export async function createAttachment(attachment: Attachment) {
  console.log("Attachment object", attachment);
  try {
    const result = await dbForApp
      .insert(attachments)
      .values(attachment)
      .returning();
    return result;
  } catch (error) {
    console.error("Error adding attachment to DB: ", error);
  }
}
