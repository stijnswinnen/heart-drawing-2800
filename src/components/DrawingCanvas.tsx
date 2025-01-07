import { Canvas } from "@/components/Canvas";
import { DrawingTools } from "@/components/DrawingTools";
import { Button } from "@/components/ui/button";
import { useDrawing } from "@/components/DrawingProvider";
import { X } from "lucide-react";

interface DrawingCanvasProps {
  isDrawing: boolean;
  hasDrawn: boolean;
  canvasKey: number;
  onDrawingComplete: () => void;
  onReset: () => void;
  onSubmit: () => void;
  session: any;
  setShowAuth: (show: boolean) => void;
  setIsDrawing: (isDrawing: boolean) => void;
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
  setIsDrawing,
}: DrawingCanvasProps) => {
  const {
    penSize,
    setPenSize,
    penColor,
    setPenColor,
    isEraser,
    setIsEraser,
  } = useDrawing();

  const handleClose = () => {
    console.log('Close button clicked');
    setIsDrawing(false);
  };

  if (!isDrawing) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
      {!hasDrawn && (
        <button 
          onClick={handleClose}
          className="fixed top-8 right-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X className="w-4 h-4" />
          Sluiten
        </button>
      )}

      <Canvas 
        key={canvasKey}
        onDrawingComplete={onDrawingComplete}
        penSize={penSize}
        penColor={isEraser ? "#FFFFFF" : penColor}
      />

      {hasDrawn && (
        <div className="fixed md:top-8 md:bottom-auto bottom-[11rem] md:right-8 flex gap-4 animate-fade-in mt-2 md:mt-0">
          <Button
            onClick={onSubmit}
            variant="default"
            className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
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
      
      <DrawingTools
        penSize={penSize}
        setPenSize={setPenSize}
        penColor={penColor}
        setPenColor={setPenColor}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
      />
    </div>
  );
};