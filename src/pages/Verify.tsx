import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const email = searchParams.get("email");

        if (!token || !email) {
          throw new Error("Invalid verification link");
        }

        const { data, error } = await supabase
          .from("heart_users")
          .update({ email_verified: true })
          .eq("email", email)
          .eq("verification_token", token)
          .select()
          .single();

        if (error || !data) {
          throw new Error("Invalid or expired verification link");
        }

        toast.success("E-mailadres succesvol geverifieerd!");
        navigate("/");
      } catch (error: any) {
        console.error("Error verifying email:", error);
        toast.error(error.message || "Er is iets misgegaan bij het verifiëren van je e-mailadres");
        navigate("/");
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
          <h1 className="text-2xl font-bold mb-4">E-mailadres verifiëren...</h1>
          <p>Even geduld terwijl we je e-mailadres verifiëren.</p>
        </div>
      </div>
    );
  }

  return null;
}