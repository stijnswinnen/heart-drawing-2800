import { Button } from "@/components/ui/button";
import { Eraser, Pen } from "lucide-react";

interface DrawingToolsProps {
  penSize: number;
  setPenSize: (size: number) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
}

export const DrawingTools = ({
  penSize,
  setPenSize,
  penColor,
  setPenColor,
  isEraser,
  setIsEraser,
}: DrawingToolsProps) => {
  const penSizes = [2, 4, 8];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-white rounded-lg shadow-lg animate-[fade-in_0.5s_ease-out]">
      <div className="flex gap-2">
        {penSizes.map((size) => (
          <Button
            key={size}
            variant={penSize === size ? "default" : "outline"}
            size="icon"
            onClick={() => {
              setPenSize(size);
              setIsEraser(false);
            }}
            className="w-10 h-10"
          >
            <Pen className={`w-${size} h-${size}`} />
          </Button>
        ))}
      </div>

      <div className="w-px h-8 bg-gray-200" />

      <Button
        variant={isEraser ? "default" : "outline"}
        size="icon"
        onClick={() => setIsEraser(!isEraser)}
        className="w-10 h-10"
      >
        <Eraser className="w-4 h-4" />
      </Button>

      <div className="w-px h-8 bg-gray-200" />

      <input
        type="color"
        value={penColor}
        onChange={(e) => {
          setPenColor(e.target.value);
          setIsEraser(false);
        }}
        className="w-10 h-10 rounded cursor-pointer"
      />
    </div>
  );
};