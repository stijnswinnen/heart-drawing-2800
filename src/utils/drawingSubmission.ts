import { supabase } from "@/integrations/supabase/client";

interface SubmissionData {
  name: string;
  email: string;
  newsletter: boolean;
}

export const submitDrawing = async (
  canvas: HTMLCanvasElement | null,
  userId: string | null,
  data: SubmissionData
) => {
  console.log('Starting drawing submission process...');
  console.log('User ID:', userId);
  console.log('Submission data:', data);
  
  if (!canvas) {
    console.error('No canvas element found');
    throw new Error("No drawing found!");
  }

  // Validate that the canvas actually contains a drawing
  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Could not get canvas context');
    throw new Error("Could not get canvas context");
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const hasDrawing = imageData.some((pixel, index) => index % 4 === 3 && pixel !== 0);

  if (!hasDrawing) {
    console.error('Canvas is empty');
    throw new Error("Please draw something before submitting!");
  }

  // Check if user with this email already exists
  const { data: existingDrawings, error: checkError } = await supabase
    .from('heart_users')
    .select('id')
    .eq('email', data.email);

  if (checkError) {
    console.error('Error checking existing user:', checkError);
    throw new Error("Failed to check existing submissions");
  }

  if (existingDrawings && existingDrawings.length > 0) {
    throw new Error("You have already submitted a heart with this email address");
  }

  console.log('Converting canvas to blob...');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to convert canvas to blob'));
    }, 'image/png');
  });

  // Generate a unique filename
  const folder = userId ? userId : 'anonymous';
  const fileName = `${folder}/${crypto.randomUUID()}.png`;
    
  console.log('Uploading to storage with filename:', fileName);

  try {
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('hearts')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error("Failed to upload drawing: " + uploadError.message);
    }

    console.log('Successfully uploaded to storage');

    // First, create the heart user
    const { data: heartUser, error: userError } = await supabase
      .from('heart_users')
      .insert({
        email: data.email,
        name: data.name,
        marketing_consent: data.newsletter
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating heart user:', userError);
      // Clean up the uploaded file
      await supabase.storage.from('hearts').remove([fileName]);
      throw new Error("Failed to save user information: " + userError.message);
    }

    // Then, create the drawing record
    const { error: dbError } = await supabase
      .from('drawings')
      .insert({
        user_id: userId,
        heart_user_id: heartUser.id,
        image_path: fileName,
        status: 'new'
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up the uploaded file and user record
      await supabase.storage.from('hearts').remove([fileName]);
      await supabase.from('heart_users').delete().eq('id', heartUser.id);
      throw new Error("Failed to save drawing information: " + dbError.message);
    }

    console.log('Successfully inserted into database');
    return fileName;
  } catch (error) {
    console.error('Error in submission process:', error);
    throw error;
  }
};

export const deleteDrawing = async (imagePath: string) => {
  console.log('Attempting to delete drawing:', imagePath);
  const { error: storageError } = await supabase.storage
    .from('hearts')
    .remove([imagePath]);

  if (storageError) {
    console.error('Storage deletion error:', storageError);
    throw new Error("Failed to delete drawing: " + storageError.message);
  }
  console.log('Successfully deleted drawing from storage');
};