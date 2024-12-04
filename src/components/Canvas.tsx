import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";

interface CanvasProps {
  onDrawingComplete: () => void;
}

export const Canvas = ({ onDrawingComplete }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "transparent",
      isDrawingMode: true,
    });

    // Set up the drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 2;
      canvas.freeDrawingBrush.color = "#000000";
    }

    setFabricCanvas(canvas);
    toast("Draw your heart! Be creative ❤️");

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on("path:created", () => {
      onDrawingComplete();
    });
  }, [fabricCanvas, onDrawingComplete]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="cursor-pen" />
    </div>
  );
};