import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitDrawing, deleteDrawing } from "@/utils/drawingSubmission";
import { SubmitForm } from "@/components/SubmitForm";
import { ReplaceDrawingDialog } from "@/components/ReplaceDrawingDialog";
import { SubmissionConfetti } from "@/components/SubmissionConfetti";

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
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleSubmit = async (data: { name: string; email: string; newsletter: boolean }) => {
    try {
      console.log('Starting submission process with data:', { ...data, email: '***' });
      
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        console.error('No canvas element found');
        toast.error("Versturen van tekening is mislukt");
        return;
      }

      // First check if there's an existing heart user with this email
      console.log('Checking for existing heart user...');
      const { data: existingUsers, error: userError } = await supabase
        .from('heart_users')
        .select('id, email_verified')
        .eq('email', data.email);

      if (userError) {
        console.error('Error checking for existing heart user:', userError);
        toast.error("Versturen van tekening is mislukt");
        return;
      }

      console.log('Existing users check result:', existingUsers?.length || 0, 'users found');

      // If we found an existing user, check if they have any drawings
      if (existingUsers && existingUsers.length > 0) {
        console.log('Found existing heart user, checking for any drawings');
        const { data: existingDrawings, error: drawingError } = await supabase
          .from('drawings')
          .select('*')
          .eq('heart_user_id', existingUsers[0].id);

        if (drawingError) {
          console.error('Error checking for existing drawings:', drawingError);
          toast.error("Versturen van tekening is mislukt");
          return;
        }

        console.log('Existing drawings check result:', existingDrawings?.length || 0, 'drawings found');

        if (existingDrawings && existingDrawings.length > 0) {
          console.log('Found existing drawing, showing replace dialog');
          setExistingDrawing(existingDrawings[0]);
          setShowReplaceDialog(true);
          setShowSubmitForm(false);
          return;
        }
      }

      // Always submit the drawing, regardless of email verification status
      console.log('Proceeding with drawing submission...');
      const fileName = await submitDrawing(canvas, session?.user?.id || null, data);
      
      if (!fileName) {
        console.error('No filename returned from submitDrawing');
        toast.error("Versturen van tekening is mislukt");
        return;
      }

      // Check if the email needs verification
      const isEmailVerified = existingUsers?.[0]?.email_verified;
      if (!isEmailVerified) {
        toast.success("We hebben je een verificatie e-mail gestuurd. Controleer je inbox en klik op de verificatielink.");
      } else {
        toast.success("Tekening werd met succes doorgestuurd!");
      }

      setShowConfetti(true);
      setShowSubmitForm(false);
      setIsDrawing(false);
      setHasDrawn(false);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.message || "Versturen van tekening is mislukt");
    }
  };

  const handleReplaceDrawing = async () => {
    try {
      if (!existingDrawing?.image_path) {
        console.error('No existing drawing found to replace');
        toast.error("No existing drawing found");
        return;
      }

      console.log('Attempting to delete file:', existingDrawing.image_path);
      await deleteDrawing(existingDrawing.image_path);
      
      // Delete the database record
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
      <SubmissionConfetti isActive={showConfetti} />
    </>
  );
};