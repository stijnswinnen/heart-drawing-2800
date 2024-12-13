import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitDrawing, deleteDrawing } from "@/utils/drawingSubmission";
import { SubmitForm } from "@/components/SubmitForm";
import { ReplaceDrawingDialog } from "@/components/ReplaceDrawingDialog";

interface DrawingSubmissionHandlerProps {
  session: any;
  showSubmitForm: boolean;
  setShowSubmitForm: (show: boolean) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setHasDrawn: (hasDrawn: boolean) => void;
}

export const DrawingSubmissionHandler = ({
  session,
  showSubmitForm,
  setShowSubmitForm,
  setIsDrawing,
  setHasDrawn,
}: DrawingSubmissionHandlerProps) => {
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [existingDrawing, setExistingDrawing] = useState<any>(null);

  const handleSubmit = async (data: { name: string; email: string; newsletter: boolean }) => {
    try {
      if (!session?.user?.id) {
        toast.error("You must be signed in to submit a drawing");
        return;
      }

      const canvas = document.querySelector('canvas');
      if (!canvas) {
        toast.error("No canvas found");
        return;
      }

      console.log('Checking for existing drawings...');
      const { data: existingDrawings, error: checkError } = await supabase
        .from('drawings')
        .select('*')
        .eq('user_id', session.user.id);

      if (checkError) {
        console.error('Error checking for existing drawings:', checkError);
        toast.error("Failed to check for existing drawings");
        return;
      }

      console.log('Existing drawings:', existingDrawings);

      if (existingDrawings && existingDrawings.length > 0) {
        setExistingDrawing(existingDrawings[0]);
        setShowReplaceDialog(true);
        setShowSubmitForm(false);
        return;
      }

      console.log('Submitting new drawing...');
      const fileName = await submitDrawing(canvas, session.user.id, data);
      
      if (!fileName) {
        toast.error("Failed to submit drawing");
        return;
      }

      console.log('Drawing submitted successfully:', fileName);
      toast.success("Thank you for your submission! ❤️");
      setShowSubmitForm(false);
      setIsDrawing(false);
      setHasDrawn(false);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.message || "Failed to submit drawing");
    }
  };

  const handleReplaceDrawing = async () => {
    try {
      if (!existingDrawing?.image_path) {
        toast.error("No existing drawing found");
        return;
      }

      console.log('Attempting to delete file:', existingDrawing.image_path);
      await deleteDrawing(existingDrawing.image_path);
      
      // Delete the database record
      const { error: deleteError } = await supabase
        .from('drawings')
        .delete()
        .eq('user_id', session?.user?.id);

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
    <>
      {showSubmitForm && (
        <SubmitForm onClose={() => setShowSubmitForm(false)} onSubmit={handleSubmit} />
      )}
      {showReplaceDialog && (
        <ReplaceDrawingDialog 
          onConfirm={handleReplaceDrawing} 
          onCancel={() => {
            setShowReplaceDialog(false);
            setShowSubmitForm(false);
          }} 
        />
      )}
    </>
  );
};