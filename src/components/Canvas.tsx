import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";

interface CanvasProps {
  onDrawingComplete: () => void;
  penSize: number;
  penColor: string;
}

export const Canvas = ({ onDrawingComplete, penSize, penColor }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.7,
      backgroundColor: "transparent",
      isDrawingMode: true,
    });

    // Set up the drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = penSize;
      canvas.freeDrawingBrush.color = penColor;
    }

    setFabricCanvas(canvas);
    toast("Draw your heart! Be creative ❤️");

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.7,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas?.freeDrawingBrush) return;
    fabricCanvas.freeDrawingBrush.width = penSize;
    fabricCanvas.freeDrawingBrush.color = penColor;
  }, [fabricCanvas, penSize, penColor]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on("path:created", () => {
      onDrawingComplete();
    });
  }, [fabricCanvas, onDrawingComplete]);

  return (
    <div className="relative w-full max-w-[80vw] mx-auto">
      <canvas ref={canvasRef} className="cursor-pen" />
    </div>
  );
};