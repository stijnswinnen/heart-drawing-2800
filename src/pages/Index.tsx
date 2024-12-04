import { useState } from "react";
import { Canvas } from "@/components/Canvas";
import { SubmitForm } from "@/components/SubmitForm";
import { Heart } from "lucide-react";

const Index = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleHeartClick = () => {
    setIsDrawing(true);
  };

  const handleDrawingComplete = () => {
    setHasDrawn(true);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      <div 
        className={`flex items-center gap-4 transition-transform duration-700 ${
          isDrawing ? '-translate-x-[30%]' : 'translate-x-0'
        }`}
      >
        <h1 
          className="text-[200px] font-['Chewy'] text-foreground z-10 opacity-0 animate-[fade-in_1s_ease-out_forwards]"
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
        <div className="absolute inset-0 flex items-center justify-center animate-[fade-in_0.5s_ease-out]">
          <Canvas onDrawingComplete={handleDrawingComplete} />
        </div>
      )}

      {hasDrawn && (
        <button
          onClick={() => setShowForm(true)}
          className="absolute bottom-8 right-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity animate-[fade-in_0.5s_ease-out]"
        >
          Submit
        </button>
      )}

      {showForm && <SubmitForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Index;