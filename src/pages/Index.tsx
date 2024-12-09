import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DrawingTitle } from "@/components/DrawingTitle";
import { AuthDialog } from "@/components/AuthDialog";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { LockButton } from "@/components/LockButton";
import { SubmitForm } from "@/components/SubmitForm";
import { ReplaceDrawingDialog } from "@/components/ReplaceDrawingDialog";

const Index = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penSize, setPenSize] = useState(5);
  const [penColor, setPenColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleHeartClick = () => {
    setIsDrawing(true);
  };

  const handleDrawingComplete = () => {
    setHasDrawn(true);
  };

  const handleSubmit = async ({ name, email, newsletter }) => {
    try {
      // Check if user has already submitted a drawing
      const { data: existingDrawings } = await supabase
        .from('drawings')
        .select('*')
        .eq('email', email)
        .single();

      if (existingDrawings) {
        setPendingSubmission({ name, email, newsletter });
        setShowReplaceDialog(true);
        return;
      }

      await submitDrawing({ name, email, newsletter });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const submitDrawing = async ({ name, email, newsletter }) => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        toast.error("No drawing found!");
        return;
      }

      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );

      const fileName = `${session?.user?.id}/${crypto.randomUUID()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('hearts')
        .upload(fileName, blob);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Failed to upload drawing");
        return;
      }

      const { error: dbError } = await supabase
        .from('drawings')
        .insert({
          user_id: session?.user?.id,
          image_path: fileName,
          name,
          email,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error("Failed to save drawing information");
        return;
      }

      toast.success("Your heart has been saved! ❤️");
      setShowSubmitForm(false);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleReplaceDrawing = async () => {
    if (!pendingSubmission) return;

    try {
      const { data: existingDrawing } = await supabase
        .from('drawings')
        .select('*')
        .eq('email', pendingSubmission.email)
        .single();

      if (existingDrawing) {
        // Delete the old image from storage
        await supabase.storage
          .from('hearts')
          .remove([existingDrawing.image_path]);

        // Delete the old drawing record
        await supabase
          .from('drawings')
          .delete()
          .eq('id', existingDrawing.id);
      }

      // Submit the new drawing
      await submitDrawing(pendingSubmission);
      setShowReplaceDialog(false);
      setPendingSubmission(null);
    } catch (error) {
      console.error('Replace drawing error:', error);
      toast.error("Failed to replace drawing");
    }
  };

  const handleCancelReplace = () => {
    setShowReplaceDialog(false);
    setPendingSubmission(null);
    handleReset();
  };

  const handleReset = () => {
    setHasDrawn(false);
    setCanvasKey(prev => prev + 1);
    toast.info("Canvas cleared!");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      <LockButton onClick={() => setShowAuth(true)} />

      {showAuth && (
        <AuthDialog onClose={() => setShowAuth(false)} />
      )}

      <DrawingTitle isDrawing={isDrawing} onHeartClick={handleHeartClick} />
      
      <DrawingCanvas 
        isDrawing={isDrawing}
        hasDrawn={hasDrawn}
        penSize={penSize}
        setPenSize={setPenSize}
        penColor={penColor}
        setPenColor={setPenColor}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        canvasKey={canvasKey}
        onDrawingComplete={handleDrawingComplete}
        onReset={handleReset}
        onSubmit={() => setShowSubmitForm(true)}
        session={session}
        setShowAuth={setShowAuth}
      />

      {showSubmitForm && (
        <SubmitForm
          onClose={() => setShowSubmitForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showReplaceDialog && (
        <ReplaceDrawingDialog
          onConfirm={handleReplaceDrawing}
          onCancel={handleCancelReplace}
        />
      )}
    </div>
  );
};

export default Index;