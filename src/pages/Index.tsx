import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DrawingTitle } from "@/components/DrawingTitle";
import { AuthDialog } from "@/components/AuthDialog";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { LockButton } from "@/components/LockButton";
import { DrawingProvider } from "@/components/DrawingProvider";
import { DrawingSubmissionHandler } from "@/components/DrawingSubmissionHandler";

export default function Index() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  const handleHeartClick = () => {
    setIsDrawing(true);
  };

  return (
    <DrawingProvider>
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
          canvasKey={1}
          onDrawingComplete={() => setHasDrawn(true)}
          onReset={() => setHasDrawn(false)}
          onSubmit={() => setShowSubmitForm(true)}
          session={session}
          setShowAuth={setShowAuth}
        />

        <LockButton onClick={() => setIsDrawing(true)} />

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