import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const cleanupPendingVerificationFiles = async () => {
  try {
    console.log('Starting storage cleanup for pending verification files...');
    
    // Get all files in the hearts bucket
    const { data: files, error: listError } = await supabase.storage
      .from('hearts')
      .list();

    if (listError) {
      console.error('Error listing files:', listError);
      throw listError;
    }

    if (!files || files.length === 0) {
      console.log('No files found in the hearts bucket');
      return;
    }

    console.log('Found files in hearts bucket:', files.length);

    // Get all valid image paths from the drawings table
    const { data: validDrawings, error: dbError } = await supabase
      .from('drawings')
      .select('image_path');

    if (dbError) {
      console.error('Error getting valid drawings:', dbError);
      throw dbError;
    }

    // Create a set of valid image paths for quick lookup
    const validPaths = new Set(validDrawings?.map(d => d.image_path.split('/').pop()));

    // Find files that don't have a corresponding drawing entry
    const filesToDelete = files.filter(file => !validPaths.has(file.name));

    if (filesToDelete.length === 0) {
      console.log('No orphaned files found to delete');
      return;
    }

    console.log('Found orphaned files to delete:', filesToDelete.length);

    // Delete the orphaned files
    const { error: deleteError } = await supabase.storage
      .from('hearts')
      .remove(filesToDelete.map(file => file.name));

    if (deleteError) {
      console.error('Error deleting files:', deleteError);
      throw deleteError;
    }

    console.log('Successfully deleted orphaned files');
    toast.success(`Successfully cleaned up ${filesToDelete.length} orphaned files`);
  } catch (error) {
    console.error('Error in storage cleanup:', error);
    toast.error("Failed to clean up storage files");
  }
};