import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitDrawing } from "@/utils/drawingSubmission";
import { SubmitForm } from "@/components/SubmitForm";
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

      // Submit the drawing
      console.log('Proceeding with drawing submission...');
      const fileName = await submitDrawing(canvas, session?.user?.id || null, data);
      
      if (!fileName) {
        console.error('No filename returned from submitDrawing');
        toast.error("Versturen van tekening is mislukt");
        return;
      }

      // Check if the profile exists and is verified
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', session?.user?.id)
        .single();

      if (!profile?.email_verified) {
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

  return (
    <>
      {showSubmitForm && (
        <SubmitForm onClose={() => setShowSubmitForm(false)} onSubmit={handleSubmit} />
      )}
      <SubmissionConfetti isActive={showConfetti} />
    </>
  );
};