import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if we have a token in the URL
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          console.error('Missing token or email in URL');
          throw new Error("Ongeldige verificatie link");
        }

        // Use secure RPC for verification
        const { data: verified, error: verifyError } = await supabase
          .rpc('verify_profile_secure', { p_email: email, p_token: token });

        if (verifyError || !verified) {
          console.error('Verification failed:', verifyError);
          throw new Error("Verificatie mislukt - ongeldig token of e-mailadres");
        }

        toast.success("E-mailadres succesvol geverifieerd!");
        setVerificationComplete(true);
      } catch (error: any) {
        console.error("Error verifying email:", error);
        toast.error(error.message || "Er is iets misgegaan bij het verifiëren van je e-mailadres");
        navigate("/");
      } finally {
        setIsVerifying(false);
      }
    };

    handleEmailVerification();
  }, [navigate, searchParams]);

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