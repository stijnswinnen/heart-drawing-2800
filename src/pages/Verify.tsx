import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Verify() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email_confirmed_at) {
          toast({
            title: "Success",
            description: "E-mailadres succesvol geverifieerd!",
          });
          setVerificationComplete(true);
        } else {
          throw new Error("Email verification failed");
        }
      } catch (error: any) {
        console.error("Error verifying email:", error);
        toast({
          title: "Error",
          description: "Er is iets misgegaan bij het verifiëren van je e-mailadres",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsVerifying(false);
      }
    };

    handleEmailVerification();
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">E-mailadres verifiëren...</h1>
          <p>Even geduld terwijl we je e-mailadres verifiëren.</p>
        </div>
      </div>
    );
  }

  if (verificationComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <p className="text-lg mb-8">
            Bedankt voor jouw hart. Jouw bijdrage zal verschijnen zodra deze werd gevalideerd.
          </p>
          <Button 
            onClick={() => navigate("/hearts")} 
            className="mt-4"
          >
            Show me some love
          </Button>
        </div>
      </div>
    );
  }

  return null;
}