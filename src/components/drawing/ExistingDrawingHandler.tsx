import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteDrawing } from "@/utils/drawingSubmission";
import { ReplaceDrawingDialog } from "@/components/ReplaceDrawingDialog";

interface ExistingDrawingHandlerProps {
  existingDrawing: any;
  setShowReplaceDialog: (show: boolean) => void;
  setShowSubmitForm: (show: boolean) => void;
}

export const ExistingDrawingHandler = ({
  existingDrawing,
  setShowReplaceDialog,
  setShowSubmitForm,
}: ExistingDrawingHandlerProps) => {
  const handleReplaceDrawing = async () => {
    try {
      if (!existingDrawing?.image_path) {
        console.error('No existing drawing found to replace');
        toast.error("No existing drawing found");
        return;
      }

      console.log('Attempting to delete file:', existingDrawing.image_path);
      await deleteDrawing(existingDrawing.image_path);
      
      const { error: deleteError } = await supabase
        .from('drawings')
        .delete()
        .eq('heart_user_id', existingDrawing.heart_user_id);

      if (deleteError) {
        console.error('Error deleting drawing record:', deleteError);
        toast.error("Failed to delete existing drawing");
        return;
      }

      console.log('Old drawing deleted successfully');
      setShowReplaceDialog(false);
      setShowSubmitForm(true);
    } catch (error: any) {
      console.error('Error replacing drawing:', error);
      toast.error(error.message || "Failed to replace drawing");
    }
  };

  return (
    <ReplaceDrawingDialog 
      onConfirm={handleReplaceDrawing} 
      onCancel={() => {
        setShowReplaceDialog(false);
        setShowSubmitForm(false);
      }} 
    />
  );
};