import { useState } from "react";
import { Canvas } from "@/components/Canvas";
import { Heart } from "lucide-react";
import { DrawingTools } from "@/components/DrawingTools";

const Index = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penSize, setPenSize] = useState(5);
  const [penColor, setPenColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);

  const handleHeartClick = () => {
    setIsDrawing(true);
  };

  const handleDrawingComplete = () => {
    setHasDrawn(true);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      <div 
        className={`flex items-center gap-4 transition-all duration-700 ${
          isDrawing ? '-translate-x-[30%]' : 'translate-x-0'
        }`}
      >
        <h1 
          className={`text-[clamp(100px,20vw,200px)] font-['Chewy'] transition-opacity duration-700 ${
            isDrawing ? 'opacity-20' : 'opacity-100'
          } opacity-0 animate-[fade-in_1s_ease-out_forwards]`}
        >
          2800
        </h1>
        
        {!isDrawing && (
          <div 
            onClick={handleHeartClick} 
            className="cursor-pointer transform hover:scale-105 transition-transform"
          >
            <Heart 
              size={200} 
              className="text-primary animate-[pulse_1.5s_ease-in-out_infinite] z-10" 
              fill="#FFDEE2"
            />
          </div>
        )}
      </div>
      
      {isDrawing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-[fade-in_0.5s_ease-out]">
          <Canvas 
            onDrawingComplete={handleDrawingComplete}
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
        </div>
      )}

      {hasDrawn && (
        <button
          className="absolute bottom-8 right-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity animate-[fade-in_0.5s_ease-out]"
        >
          Submit
        </button>
      )}
    </div>
  );
};

export default Index;