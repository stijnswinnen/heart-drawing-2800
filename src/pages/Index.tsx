import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DrawingTitle } from "@/components/DrawingTitle";
import { AuthDialog } from "@/components/AuthDialog";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { LockButton } from "@/components/LockButton";
import { SubmitForm } from "@/components/SubmitForm";
import { ReplaceDrawingDialog } from "@/components/ReplaceDrawingDialog";
import { submitDrawing, deleteDrawing } from "@/utils/drawingSubmission";

export default function Index() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [existingDrawing, setExistingDrawing] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [penSize, setPenSize] = useState(5);
  const [penColor, setPenColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  const handleSubmit = async (data: { name: string; email: string; newsletter: boolean }) => {
    try {
      if (session?.user?.id) {
        console.log('Checking for existing drawings...');
        const { data: existingDrawings, error } = await supabase
          .from('drawings')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error checking for existing drawings:', error);
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
      }

      const canvas = document.querySelector('canvas');
      const fileName = await submitDrawing(canvas, session?.user?.id, data);
      console.log('Drawing submitted successfully:', fileName);
      toast.success("Thank you for your submission! ❤️");
      setShowSubmitForm(false);
      setIsDrawing(false);
      setHasDrawn(false);
    } catch (error) {
      console.error('Error submitting drawing:', error);
      toast.error("Failed to submit drawing");
    }
  };

  const handleReplaceDrawing = async () => {
    try {
      if (existingDrawing?.image_path) {
        console.log('Attempting to delete file:', existingDrawing.image_path);
        await deleteDrawing(existingDrawing.image_path);
        console.log('Old drawing deleted successfully');
        setShowReplaceDialog(false);
        setShowSubmitForm(true);
      }
    } catch (error) {
      console.error('Error replacing drawing:', error);
      toast.error("Failed to replace drawing");
    }
  };

  const handleHeartClick = () => {
    setIsDrawing(true);
  };

  return (
    <div>
      <DrawingTitle 
        isDrawing={isDrawing} 
        onHeartClick={handleHeartClick}
      />
      {showAuth && (
        <AuthDialog onClose={() => setShowAuth(false)} />
      )}
      <DrawingCanvas
        isDrawing={isDrawing}
        hasDrawn={hasDrawn}
        penSize={penSize}
        setPenSize={setPenSize}
        penColor={penColor}
        setPenColor={setPenColor}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        canvasKey={1}
        onDrawingComplete={() => setHasDrawn(true)}
        onReset={() => setHasDrawn(false)}
        onSubmit={() => setShowSubmitForm(true)}
        session={session}
        setShowAuth={setShowAuth}
      />
      <LockButton onClick={() => setIsDrawing(true)} />
      {showSubmitForm && (
        <SubmitForm onClose={() => setShowSubmitForm(false)} onSubmit={handleSubmit} />
      )}
      {showReplaceDialog && (
        <ReplaceDrawingDialog 
          onConfirm={handleReplaceDrawing} 
          onCancel={() => setShowReplaceDialog(false)} 
        />
      )}
    </div>
  );
}