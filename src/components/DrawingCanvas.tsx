import { Canvas } from "@/components/Canvas";
import { DrawingTools } from "@/components/DrawingTools";
import { Button } from "@/components/ui/button";
import { useDrawing } from "@/components/DrawingProvider";

interface DrawingCanvasProps {
  isDrawing: boolean;
  hasDrawn: boolean;
  canvasKey: number;
  onDrawingComplete: () => void;
  onReset: () => void;
  onSubmit: () => void;
  session: any;
  setShowAuth: (show: boolean) => void;
}

export const DrawingCanvas = ({
  isDrawing,
  hasDrawn,
  canvasKey,
  onDrawingComplete,
  onReset,
  onSubmit,
  session,
  setShowAuth,
}: DrawingCanvasProps) => {
  const {
    penSize,
    setPenSize,
    penColor,
    setPenColor,
    isEraser,
    setIsEraser,
    setCanUndo,
    canUndo,
  } = useDrawing();

  const handleUndo = () => {
    // This function will be replaced by Canvas component's handleUndoAction
  };

  if (!isDrawing) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
      <Canvas 
        key={canvasKey}
        onDrawingComplete={onDrawingComplete}
        penSize={penSize}
        penColor={isEraser ? "#FFFFFF" : penColor}
        onUndo={handleUndo}
      />
      
      <DrawingTools
        penSize={penSize}
        setPenSize={setPenSize}
        penColor={penColor}
        setPenColor={setPenColor}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        onUndo={handleUndo}
      />

      {hasDrawn && (
        <div className="fixed md:top-8 md:bottom-auto md:right-8 bottom-24 flex gap-4 animate-fade-in mt-2 md:mt-0">
          <Button
            onClick={onSubmit}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Verzenden
          </Button>
          <Button
            variant="secondary"
            onClick={onReset}
            className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};