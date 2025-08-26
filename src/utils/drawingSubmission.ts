import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

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
  console.log('Submission data:', { ...data, email: '***' });
  
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

  // First, create or get the profile
  let profileId;
  console.log('Checking for existing profile...');
  const { data: existingProfile, error: profileError } = await supabase
    .rpc('get_profile_minimal_by_email', { p_email: data.email });

  if (profileError) {
    console.error('Error checking for existing profile:', profileError);
    throw new Error("Failed to check user information: " + profileError.message);
  }

  if (existingProfile?.[0]) {
    profileId = existingProfile[0].id;
    console.log('Using existing profile ID:', profileId);
  } else {
    // Create new profile
    console.log('Creating new profile...');
    const newProfileId = uuidv4();
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: newProfileId,
        email: data.email,
        name: data.name,
        marketing_consent: data.newsletter,
        email_verified: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      throw new Error("Failed to save user information: " + insertError.message);
    }

    profileId = profile.id;
    console.log('Created new profile with ID:', profileId);
  }

  console.log('Converting canvas to blob...');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to convert canvas to blob'));
    }, 'image/png');
  });

  // Generate a unique filename without folders
  const prefix = userId ? `u${userId.slice(0, 8)}` : 'anon';
  const fileName = `${prefix}_${crypto.randomUUID()}.png`;
    
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

    // Create the drawing record
    const { error: dbError } = await supabase
      .from('drawings')
      .insert({
        user_id: userId,
        heart_user_id: profileId,
        image_path: fileName,
        status: 'new'
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up the uploaded file
      await supabase.storage.from('hearts').remove([fileName]);
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