import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDrawing } from "./DrawingProvider";

interface CanvasProps {
  onDrawingComplete: () => void;
  penSize: number;
  penColor: string;
  key?: number | string;
  handleUndo: (undoFn: () => void) => void;
}

export const Canvas = ({ onDrawingComplete, penSize, penColor, key, handleUndo }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const isMobile = useIsMobile();
  const { setCanUndo } = useDrawing();
  const historyRef = useRef<string[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: isMobile ? window.innerWidth : window.innerWidth * 0.6,
      height: window.innerHeight * 0.7,
      backgroundColor: "#FFFFFF",
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = penSize;
    canvas.freeDrawingBrush.color = penColor || "#000000";

    setFabricCanvas(canvas);
    toast("Teken jouw hart! Wees creatief ❤️");

    const handleResize = () => {
      canvas.setDimensions({
        width: isMobile ? window.innerWidth : window.innerWidth * 0.6,
        height: window.innerHeight * 0.7,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!fabricCanvas?.freeDrawingBrush) return;
    fabricCanvas.freeDrawingBrush.width = penSize;
    fabricCanvas.freeDrawingBrush.color = penColor || "#000000";
  }, [fabricCanvas, penSize, penColor]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on("path:created", () => {
      onDrawingComplete();
      // Save canvas state after each path
      const canvasState = JSON.stringify(fabricCanvas.toJSON());
      historyRef.current.push(canvasState);
      setCanUndo(true);
    });
  }, [fabricCanvas, onDrawingComplete, setCanUndo]);

  // Handle the undo functionality
  const handleUndoAction = () => {
    if (!fabricCanvas || historyRef.current.length === 0) return;

    // Remove the last state
    historyRef.current.pop();
    
    if (historyRef.current.length === 0) {
      // If no more history, clear canvas
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "#FFFFFF";
      fabricCanvas.renderAll();
      setCanUndo(false);
    } else {
      // Load the previous state
      const previousState = historyRef.current[historyRef.current.length - 1];
      fabricCanvas.loadFromJSON(previousState, () => {
        fabricCanvas.renderAll();
      });
    }

    // Update undo availability
    setCanUndo(historyRef.current.length > 0);
  };

  // Register the undo function with the parent
  useEffect(() => {
    handleUndo(handleUndoAction);
  }, [handleUndo]);

  return (
    <div className={`relative mx-auto md:mr-0 ${isMobile ? 'w-full' : 'w-[60%]'}`}>
      <canvas 
        ref={canvasRef} 
        className={`cursor-crosshair border border-dashed border-gray-300 ${isMobile ? '' : ''}`} 
      />
    </div>
  );
};