import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        toast.error("Verificatie token ontbreekt");
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-email', {
          body: { token }
        });

        if (error) throw error;

        toast.success("E-mailadres werd met succes geverifieerd");
        navigate('/');
      } catch (error: any) {
        console.error('Verification error:', error);
        toast.error(error.message || "Verificatie mislukt");
        navigate('/');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">E-mailadres verifiëren...</h1>
          <p className="text-muted-foreground">Even geduld terwijl we je e-mailadres verifiëren.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Verify;