import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DrawingTitle } from "@/components/DrawingTitle";
import { AuthDialog } from "@/components/AuthDialog";
import { Canvas } from "@/components/Canvas";
import { DrawingTools } from "@/components/DrawingTools";
import { Button } from "@/components/ui/button";
import { useDrawing, DrawingProvider } from "@/components/DrawingProvider";
import { DrawingSubmissionHandler } from "@/components/DrawingSubmissionHandler";
import { Navigation } from "@/components/Navigation";
import { HomeFooter } from "@/components/HomeFooter";
import { X } from "lucide-react";

interface IndexProps {
  canvasMode?: boolean;
}

function IndexInner({ canvasMode = false }: IndexProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [canvasKey, setCanvasKey] = useState(1);
  const { penSize, setPenSize, penColor, setPenColor, isEraser, setIsEraser } = useDrawing();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  // Toggle body class for shared-element transition
  useEffect(() => {
    if (canvasMode) {
      document.body.classList.add("canvas-mode");
    } else {
      document.body.classList.remove("canvas-mode");
    }
    return () => document.body.classList.remove("canvas-mode");
  }, [canvasMode]);

  const enterDrawMode = useCallback(() => {
    navigate("/teken");
  }, [navigate]);

  const exitDrawMode = useCallback(() => {
    setHasDrawn(false);
    navigate("/");
  }, [navigate]);

  // Escape exits canvas
  useEffect(() => {
    if (!canvasMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitDrawMode();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canvasMode, exitDrawMode]);

  const handleReset = () => {
    setHasDrawn(false);
    setCanvasKey((p) => p + 1);
  };

  return (
    <div>
      <Navigation isDrawing={canvasMode} />

      {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}

      <div className="home-stage">
        <DrawingTitle onHeartClick={enterDrawMode} />

        <div className="canvas-stage">
          <div className="canvas-board">
            {canvasMode && (
              <Canvas
                key={canvasKey}
                onDrawingComplete={() => setHasDrawn(true)}
                penSize={penSize}
                penColor={isEraser ? "#FFFFFF" : penColor}
              />
            )}
          </div>
        </div>
      </div>

      {/* Canvas-mode chrome */}
      {canvasMode && (
        <>
          <button
            type="button"
            className="canvas-close canvas-mode-only"
            onClick={exitDrawMode}
            aria-label="Sluiten"
          >
            <X className="w-4 h-4" />
            Sluiten
          </button>

          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="canvas-privacy canvas-mode-only"
          >
            🔒 Privacy Policy
          </a>

          <DrawingTools
            penSize={penSize}
            setPenSize={setPenSize}
            penColor={penColor}
            setPenColor={setPenColor}
            isEraser={isEraser}
            setIsEraser={setIsEraser}
          />

          {hasDrawn && (
            <div className="fixed top-16 right-6 flex gap-3 z-[60] canvas-mode-only">
              <Button onClick={() => setShowSubmitForm(true)}>Verzenden</Button>
              <Button variant="secondary" onClick={handleReset}>Reset</Button>
            </div>
          )}
        </>
      )}

      <DrawingSubmissionHandler
        session={session}
        showSubmitForm={showSubmitForm}
        setShowSubmitForm={setShowSubmitForm}
        setIsDrawing={(v: boolean) => { if (!v) navigate("/"); }}
        setHasDrawn={setHasDrawn}
      />

      {!canvasMode && <HomeFooter />}
    </div>
  );
}

export default function Index({ canvasMode }: IndexProps = {}) {
  return (
    <DrawingProvider>
      <IndexInner canvasMode={canvasMode} />
    </DrawingProvider>
  );
}
