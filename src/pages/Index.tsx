import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DrawingTitle } from "@/components/DrawingTitle";
import { AuthDialog } from "@/components/AuthDialog";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { LockButton } from "@/components/LockButton";
import { DrawingProvider } from "@/components/DrawingProvider";
import { DrawingSubmissionHandler } from "@/components/DrawingSubmissionHandler";
import { Navigation } from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [canvasKey, setCanvasKey] = useState(1);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();

    // Show the toast notification on page load only on mobile
    if (isMobile) {
      toast({
        title: "Druk op het hart om te beginnen.",
        duration: 5000,
      });
    }
  }, [isMobile]);

  const handleHeartClick = () => {
    setIsDrawing(true);
  };

  const handleReset = () => {
    setHasDrawn(false);
    setCanvasKey(prev => prev + 1);
  };

  return (
    <DrawingProvider>
      <div>
        <Navigation isDrawing={isDrawing} />
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
          setIsDrawing={setIsDrawing}
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