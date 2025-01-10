import { supabase } from "@/integrations/supabase/client";
import { DatabaseEnums } from "@/integrations/supabase/types/enums";

export const getStorageUrl = (filename: string, status: DatabaseEnums["drawing_status"]) => {
  try {
    // Remove any leading 'optimized/' from the filename if it exists
    const cleanFilename = filename.replace(/^optimized\//, '');
    
    // Determine bucket based on status
    const bucket = status === "approved" ? "optimized" : "hearts";
    
    console.log('Getting image URL for:', { bucket, cleanFilename });
    const { data } = supabase.storage.from(bucket).getPublicUrl(cleanFilename);
    return data.publicUrl;
  } catch (err) {
    console.error('Error generating image URL:', err);
    return '';
  }
};