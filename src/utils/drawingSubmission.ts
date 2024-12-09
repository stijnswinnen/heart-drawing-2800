import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubmissionData {
  name: string;
  email: string;
  newsletter: boolean;
}

export const submitDrawing = async (
  canvas: HTMLCanvasElement | null,
  userId: string | undefined,
  data: SubmissionData
) => {
  if (!canvas) {
    toast.error("No drawing found!");
    return;
  }

  const blob = await new Promise<Blob>((resolve) => 
    canvas.toBlob((b) => resolve(b!), 'image/png')
  );

  const fileName = `${userId}/${crypto.randomUUID()}.png`;

  const { error: uploadError } = await supabase.storage
    .from('hearts')
    .upload(fileName, blob);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    toast.error("Failed to upload drawing");
    throw uploadError;
  }

  const { error: dbError } = await supabase
    .from('drawings')
    .insert({
      user_id: userId,
      image_path: fileName,
      name: data.name,
      email: data.email,
    });

  if (dbError) {
    console.error('Database error:', dbError);
    // If database insert fails, clean up the uploaded file
    await supabase.storage.from('hearts').remove([fileName]);
    toast.error("Failed to save drawing information");
    throw dbError;
  }

  return fileName;
};

export const deleteDrawing = async (imagePath: string) => {
  console.log('Attempting to delete file:', imagePath);
  const { error: storageError } = await supabase.storage
    .from('hearts')
    .remove([imagePath]);

  if (storageError) {
    console.error('Storage deletion error:', storageError);
    throw storageError;
  }
};