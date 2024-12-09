import { Canvas } from "@/components/Canvas";
import { DrawingTools } from "@/components/DrawingTools";
import { Button } from "@/components/ui/button";

interface DrawingCanvasProps {
  isDrawing: boolean;
  hasDrawn: boolean;
  penSize: number;
  setPenSize: (size: number) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
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
  penSize,
  setPenSize,
  penColor,
  setPenColor,
  isEraser,
  setIsEraser,
  canvasKey,
  onDrawingComplete,
  onReset,
  onSubmit,
  session,
  setShowAuth,
}: DrawingCanvasProps) => {
  if (!isDrawing) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
      <Canvas 
        key={canvasKey}
        onDrawingComplete={onDrawingComplete}
        penSize={penSize}
        penColor={isEraser ? "#FFFFFF" : penColor}
      />
      
      <DrawingTools
        penSize={penSize}
        setPenSize={setPenSize}
        penColor={penColor}
        setPenColor={setPenColor}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
      />

      {hasDrawn && (
        <div className="fixed bottom-24 md:top-8 md:bottom-auto md:right-8 flex gap-4 animate-fade-in">
          <Button
            onClick={() => session ? onSubmit() : setShowAuth(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Submit
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