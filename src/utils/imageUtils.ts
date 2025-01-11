import { supabase } from "@/integrations/supabase/client";
import { DatabaseEnums } from "@/integrations/supabase/types/enums";

export const getStorageUrl = (filename: string, status: DatabaseEnums["drawing_status"]) => {
  try {
    // Clean the filename by removing any 'optimized/' prefix or path segments
    const cleanFilename = filename.split('/').pop() || '';
    
    // For approved drawings, use the optimized bucket, otherwise use the hearts bucket
    const bucket = status === "approved" ? "optimized" : "hearts";
    
    console.log('Getting image URL for:', { bucket, cleanFilename, originalPath: filename });
    const { data } = supabase.storage.from(bucket).getPublicUrl(cleanFilename);
    return data.publicUrl;
  } catch (err) {
    console.error('Error generating image URL:', err);
    return '';
  }
};