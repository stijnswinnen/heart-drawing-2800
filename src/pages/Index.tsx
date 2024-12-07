import { useState, useEffect } from "react";
import { Canvas } from "@/components/Canvas";
import { Heart } from "lucide-react";
import { DrawingTools } from "@/components/DrawingTools";
import { SubmitForm } from "@/components/SubmitForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penSize, setPenSize] = useState(5);
  const [penColor, setPenColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [canvasKey, setCanvasKey] = useState(0);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleHeartClick = () => {
    setIsDrawing(true);
  };

  const handleDrawingComplete = () => {
    setHasDrawn(true);
  };

  const handleSubmit = async ({ name, email, newsletter }) => {
    if (!session) {
      toast.error("Please sign in to submit your heart");
      return;
    }

    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const randomHash = Math.random().toString(36).substring(2, 15);
      const fileName = `heart-${randomHash}.png`;
      
      setSavedImages(prev => [...prev, dataUrl]);
      
      toast.success("Your heart has been saved! ❤️");
      setShowGallery(true);
    }
  };

  const handleReset = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      setCanvasKey(prev => prev + 1);
      toast.info("Canvas cleared!");
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      <div 
        className={`flex flex-col md:flex-row items-center gap-4 transition-all duration-700 ${
          isDrawing ? 'md:translate-x-[-100%] md:ml-8 translate-y-[-30vh] md:translate-y-0' : 'translate-y-0'
        }`}
      >
        <h1 
          className={`text-[clamp(100px,20vw,200px)] font-['Montserrat_Alternates'] transition-all duration-700 ${
            isDrawing ? 'opacity-20' : 'opacity-100'
          }`}
        >
          2800
        </h1>
        
        {!isDrawing && (
          <div 
            onClick={handleHeartClick} 
            className="cursor-pointer transform hover:scale-105 transition-transform mt-4 md:mt-0"
          >
            <Heart 
              size={200} 
              className="text-primary animate-pulse z-10" 
              fill="#FFDEE2"
            />
          </div>
        )}
      </div>
      
      {isDrawing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
          <Canvas 
            key={canvasKey}
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

          {hasDrawn && (
            <div className="fixed bottom-24 md:bottom-8 md:right-8 flex gap-4 animate-fade-in">
              <Button
                onClick={() => setShowSubmitForm(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Submit
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      )}

      {showSubmitForm && (
        <SubmitForm
          onClose={() => setShowSubmitForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showGallery && savedImages.length > 0 && (
        <div className="fixed inset-0 bg-white z-50 p-8 overflow-auto">
          <Button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg"
          >
            Close
          </Button>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {savedImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Heart drawing ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;