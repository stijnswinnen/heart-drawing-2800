import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { cleanupPendingVerificationFiles } from "@/utils/storageCleanup";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { DrawingSubmissionHandler } from "@/components/DrawingSubmissionHandler";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { DrawingProvider } from "@/components/DrawingProvider";

const Index = () => {
  const session = useSession();
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    cleanupPendingVerificationFiles();
  }, []);

  const handleDrawingComplete = () => {
    setHasDrawn(true);
  };

  const handleReset = () => {
    setCanvasKey((prev) => prev + 1);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (!session) {
      setShowAuth(true);
    } else {
      setShowSubmitForm(true);
    }
  };

  return (
    <DrawingProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">2800</span>
              <Heart className="text-red-500" />
            </div>
            {!isDrawing && (
              <Button onClick={() => setIsDrawing(true)}>Teken een hartje</Button>
            )}
          </div>
        </header>

        <DrawingCanvas
          isDrawing={isDrawing}
          hasDrawn={hasDrawn}
          canvasKey={canvasKey}
          onDrawingComplete={handleDrawingComplete}
          onReset={handleReset}
          onSubmit={handleSubmit}
          session={session}
          setShowAuth={setShowAuth}
        />

        <DrawingSubmissionHandler
          session={session}
          showSubmitForm={showSubmitForm}
          setShowSubmitForm={setShowSubmitForm}
          setIsDrawing={setIsDrawing}
          setHasDrawn={setHasDrawn}
        />

        {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
      </div>
    </DrawingProvider>
  );
};

export default Index;