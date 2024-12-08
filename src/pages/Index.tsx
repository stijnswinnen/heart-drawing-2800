import { useState, useEffect } from "react";
import { Canvas } from "@/components/Canvas";
import { Heart, Lock } from "lucide-react";
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
  const [showAuth, setShowAuth] = useState(false);
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
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        toast.error("No drawing found!");
        return;
      }

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        toast.error("Failed to process drawing");
        return;
      }

      // Create unique filename
      const fileName = `${session?.user?.id}/${crypto.randomUUID()}.png`;

      // Upload to Storage
      const { error: uploadError, data } = await supabase.storage
        .from('hearts')
        .upload(fileName, blob);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Failed to upload drawing");
        return;
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('drawings')
        .insert({
          user_id: session?.user?.id,
          image_path: fileName,
          name,
          email,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error("Failed to save drawing information");
        return;
      }

      toast.success("Your heart has been saved! ❤️");
      setShowSubmitForm(false);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleReset = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      toast.info("Canvas cleared!");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Lock Icon */}
      <button
        onClick={() => setShowAuth(true)}
        className="fixed bottom-4 left-4 p-2 text-gray-300 hover:text-gray-500 transition-colors"
      >
        <Lock className="w-5 h-5" />
      </button>

      {/* Auth Dialog */}
      {showAuth && !session && (
        <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg">
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              redirectTo={window.location.origin}
            />
          </div>
        </div>
      )}

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
                onClick={() => session ? setShowSubmitForm(true) : setShowAuth(true)}
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
    </div>
  );
};

export default Index;