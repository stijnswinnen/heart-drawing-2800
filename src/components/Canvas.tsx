import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface CanvasProps {
  onDrawingComplete: () => void;
  penSize: number;
  penColor: string;
  key?: number | string;
}

export const Canvas = ({ onDrawingComplete, penSize, penColor, key }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: isMobile ? window.innerWidth : window.innerWidth * 0.6,
      height: window.innerHeight * 0.7,
      backgroundColor: "#FFFFFF",
      isDrawingMode: true,
    });

    // Create and initialize the brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = penSize;
    canvas.freeDrawingBrush.color = penColor || "#000000";

    setFabricCanvas(canvas);
    toast("Draw your heart! Be creative ❤️");

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
    });
  }, [fabricCanvas, onDrawingComplete]);

  return (
    <div className={`relative mx-auto md:mr-0 ${isMobile ? 'w-full' : 'w-[60%]'}`}>
      <canvas 
        ref={canvasRef} 
        className={`cursor-crosshair border border-dashed border-gray-300 ${isMobile ? '' : ''}`} 
      />
    </div>
  );
};