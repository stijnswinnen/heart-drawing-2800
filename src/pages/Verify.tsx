import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApprovedHeartsCarousel } from "@/components/ApprovedHeartsCarousel";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const email = searchParams.get("email");
        const preview = searchParams.get("preview");

        // Allow preview mode
        if (preview === "true") {
          console.log("Preview mode activated");
          setVerificationComplete(true);
          setIsVerifying(false);
          return;
        }

        if (!token || !email) {
          throw new Error("Invalid verification link");
        }

        const { data, error } = await supabase
          .from("heart_users")
          .update({ email_verified: true })
          .eq("email", email)
          .eq("verification_token", token)
          .select()
          .maybeSingle();

        if (error || !data) {
          throw new Error("Invalid or expired verification link");
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

  if (verificationComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <ApprovedHeartsCarousel />
          </div>
          <h1 className="text-[150px] font-bold mb-6 font-['Montserrat_Alternates'] text-center">
            2800.love
          </h1>
          <p className="text-lg mb-8">
            Bedankt voor jouw hart. Jouw bijdrage zal verschijnen zodra deze werd gevalideerd.
          </p>
        </div>
      </div>
    );
  }

  return null;
}