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
    <div className="relative min-h-screen flex items-center justify-center bg-white">
      {!isDrawing && (
        <div 
          onClick={handleHeartClick} 
          className="absolute cursor-pointer transform hover:scale-105 transition-transform"
        >
          <Heart 
            size={400} 
            className="text-primary absolute -translate-x-1/2 -translate-y-1/2" 
            fill="#FFDEE2"
          />
        </div>
      )}
      
      <h1 className="text-[200px] font-bold text-foreground z-10">2800</h1>
      
      {isDrawing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Canvas onDrawingComplete={handleDrawingComplete} />
        </div>
      )}

      {hasDrawn && (
        <button
          onClick={() => setShowForm(true)}
          className="absolute bottom-8 right-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Submit
        </button>
      )}

      {showForm && <SubmitForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Index;