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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!canvasRef.current) return;

    const computeWidth = () => {
      const parentW = wrapperRef.current?.clientWidth ?? 0;
      if (window.innerWidth < 768) return window.innerWidth;
      return parentW > 0 ? parentW : window.innerWidth * 0.6;
    };
    const computeHeight = () => window.innerHeight * 0.7;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: computeWidth(),
      height: computeHeight(),
      backgroundColor: "#FFFFFF",
      isDrawingMode: true,
      enableRetinaScaling: false,
    });

    // Create and initialize the brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.width = penSize;
    canvas.freeDrawingBrush.color = penColor || "#000000";

    setFabricCanvas(canvas);
    canvas.requestRenderAll();
    toast("Teken jouw hart! Wees creatief ❤️");

    const handleResize = () => {
      canvas.setDimensions({ width: computeWidth(), height: computeHeight() });
      canvas.requestRenderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Re-fit the canvas when the mobile breakpoint flips, without rebuilding it.
  useEffect(() => {
    if (!fabricCanvas) return;
    const parentW = wrapperRef.current?.clientWidth ?? 0;
    const width = window.innerWidth < 768
      ? window.innerWidth
      : (parentW > 0 ? parentW : window.innerWidth * 0.6);
    const height = window.innerHeight * 0.7;
    fabricCanvas.setDimensions({ width, height });
    fabricCanvas.requestRenderAll();
  }, [isMobile, fabricCanvas]);

  useEffect(() => {
    if (!fabricCanvas?.freeDrawingBrush) return;
    fabricCanvas.freeDrawingBrush.width = penSize;
    fabricCanvas.freeDrawingBrush.color = penColor || "#000000";
  }, [fabricCanvas, penSize, penColor]);

  const onDrawingCompleteRef = useRef(onDrawingComplete);
  useEffect(() => {
    onDrawingCompleteRef.current = onDrawingComplete;
  }, [onDrawingComplete]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handler = () => {
      fabricCanvas.requestRenderAll();
      onDrawingCompleteRef.current();
    };
    fabricCanvas.on("path:created", handler);
    return () => {
      fabricCanvas.off("path:created", handler);
    };
  }, [fabricCanvas]);

  return (
    <div ref={wrapperRef} className="relative w-full bg-white">
      <canvas
        ref={canvasRef}
        className="cursor-crosshair border border-dashed border-gray-300"
      />
    </div>
  );
};