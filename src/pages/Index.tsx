import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DrawingTitle } from "@/components/DrawingTitle";
import { AuthDialog } from "@/components/AuthDialog";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { LockButton } from "@/components/LockButton";
import { DrawingProvider } from "@/components/DrawingProvider";
import { DrawingSubmissionHandler } from "@/components/DrawingSubmissionHandler";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

export default function Index() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [canvasKey, setCanvasKey] = useState(1);
  const [showInfoDialog, setShowInfoDialog] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  const handleHeartClick = () => {
    setIsDrawing(true);
    setShowInfoDialog(false);
  };

  const handleReset = () => {
    setHasDrawn(false);
    setCanvasKey(prev => prev + 1);
  };

  return (
    <DrawingProvider>
      <div>
        <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welkom bij 2800</DialogTitle>
              <DialogDescription>
                Klik op het hart om te starten.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

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
          canvasKey={canvasKey}
          onDrawingComplete={() => setHasDrawn(true)}
          onReset={handleReset}
          onSubmit={() => setShowSubmitForm(true)}
          session={session}
          setShowAuth={setShowAuth}
        />

        <LockButton onClick={() => setShowAuth(true)} />

        <DrawingSubmissionHandler
          session={session}
          showSubmitForm={showSubmitForm}
          setShowSubmitForm={setShowSubmitForm}
          setIsDrawing={setIsDrawing}
          setHasDrawn={setHasDrawn}
        />
      </div>
    </DrawingProvider>
  );
}