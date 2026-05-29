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
    throw new Error("Geen tekening gevonden.");
  }

  // Validate that the canvas actually contains a drawing
  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Could not get canvas context');
    throw new Error("Kon de tekening niet inlezen. Probeer het opnieuw.");
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const hasDrawing = imageData.some((pixel, index) => index % 4 === 3 && pixel !== 0);

  if (!hasDrawing) {
    console.error('Canvas is empty');
    throw new Error("Teken eerst iets voor je verzendt.");
  }

  // First, create or get the profile
  let profileId;
  console.log('Checking for existing profile...');
  const { data: existingProfile, error: profileError } = await supabase
    .rpc('get_profile_minimal_by_email', { p_email: data.email });

  if (profileError) {
    console.error('Error checking for existing profile:', profileError);
    throw new Error("Kon je gegevens niet controleren. Probeer het opnieuw.");
  }

  if (existingProfile?.[0]) {
    profileId = existingProfile[0].id;
    console.log('Using existing profile ID:', profileId);

    // If this email belongs to a verified profile and the user is not logged in,
    // we cannot attach a new drawing anonymously (RLS protects against impersonation).
    if (existingProfile[0].email_verified && !userId) {
      const err: any = new Error(
        "Dit e-mailadres is al geregistreerd en geverifieerd. Log in om je hart te versturen."
      );
      err.code = "EMAIL_VERIFIED_LOGIN_REQUIRED";
      throw err;
    }
  } else {
    // Create new profile
    console.log('Creating new profile...');
    const newProfileId = userId ?? uuidv4();
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: newProfileId,
        email: data.email,
        name: data.name,
        marketing_consent: data.newsletter,
        email_verified: false
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      throw new Error("Kon je gegevens niet opslaan. Probeer het opnieuw.");
    }

    profileId = newProfileId;
    console.log('Created new profile with ID:', profileId);

    // Send verification email after profile creation
    try {
      console.log('Sending verification email...');
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: { email: data.email }
      });

      if (emailError) {
        console.error('Warning: Failed to send verification email:', emailError);
        // Don't throw error - continue with drawing submission
      } else {
        console.log('Verification email sent successfully');
      }
    } catch (emailError) {
      console.error('Warning: Error sending verification email:', emailError);
      // Continue with drawing submission even if email fails
    }
  }


  console.log('Converting canvas to transparent blob...');
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext('2d');
  if (!exportCtx) throw new Error('Could not get export canvas context');
  exportCtx.drawImage(canvas, 0, 0);
  const exportImageData = exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
  const pixels = exportImageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] === 255 && pixels[i + 1] === 255 && pixels[i + 2] === 255) {
      pixels[i + 3] = 0;
    }
  }
  exportCtx.putImageData(exportImageData, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) => {
    exportCanvas.toBlob((b) => {
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