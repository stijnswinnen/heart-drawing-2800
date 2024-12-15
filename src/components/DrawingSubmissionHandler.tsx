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
      console.log('Starting submission process with data:', data);
      
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        console.error('No canvas element found');
        toast.error("Versturen van tekening is mislukt");
        return;
      }

      // First check if there's an existing heart user with this email
      console.log('Checking for existing heart user with email:', data.email);
      const { data: existingUsers, error: userError } = await supabase
        .from('heart_users')
        .select('id, email_verified')
        .eq('email', data.email);

      if (userError) {
        console.error('Error checking for existing heart user:', userError);
        toast.error("Versturen van tekening is mislukt");
        return;
      }

      let heartUserId;

      if (existingUsers && existingUsers.length > 0) {
        heartUserId = existingUsers[0].id;
        
        // Check if they have any drawings (regardless of status)
        const { data: existingDrawings, error: drawingError } = await supabase
          .from('drawings')
          .select('*')
          .eq('heart_user_id', heartUserId);

        if (drawingError) {
          console.error('Error checking for existing drawings:', drawingError);
          toast.error("Versturen van tekening is mislukt");
          return;
        }

        if (existingDrawings && existingDrawings.length > 0) {
          console.log('Found existing drawing, showing replace dialog');
          setExistingDrawing(existingDrawings[0]);
          setShowReplaceDialog(true);
          setShowSubmitForm(false);
          return;
        }
      } else {
        // Create new heart user
        const { data: newUser, error: createError } = await supabase
          .from('heart_users')
          .insert({
            email: data.email,
            name: data.name,
            marketing_consent: data.newsletter
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating heart user:', createError);
          toast.error("Versturen van tekening is mislukt");
          return;
        }

        heartUserId = newUser.id;
      }

      // Submit the drawing with pending_verification status
      const fileName = await submitDrawing(canvas, session?.user?.id || null, data, heartUserId);
      
      if (!fileName) {
        console.error('No filename returned from submitDrawing');
        toast.error("Versturen van tekening is mislukt");
        return;
      }

      // Send verification email
      const { error: emailError, data: emailResponse } = await supabase.functions.invoke('send-verification-email', {
        body: { 
          heartUserId,
          name: data.name,
          email: data.email
        }
      });

      if (emailError) {
        // Parse the error response
        let errorMessage = "Versturen van verificatie e-mail is mislukt";
        try {
          const errorBody = JSON.parse(emailError.message);
          if (errorBody?.message) {
            errorMessage = errorBody.message;
          }
        } catch {
          console.error('Error parsing email error:', emailError);
        }
        toast.error(errorMessage);
        return;
      }

      console.log('Drawing submitted successfully with filename:', fileName);
      toast.success("Controleer je e-mail om je tekening te bevestigen!");
      setShowSubmitForm(false);
      setIsDrawing(false);
      setHasDrawn(false);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error("Versturen van tekening is mislukt");
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
    </>
  );
};