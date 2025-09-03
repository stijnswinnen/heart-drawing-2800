import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { FormFields } from "./form/FormFields";
import { FormActions } from "./form/FormActions";
import { NewsletterField } from "./form/NewsletterField";
import { PrivacyConsentField } from "./form/PrivacyConsentField";
import { useSession } from "@supabase/auth-helpers-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Naam moet minstens 2 karakters bevatten.",
  }),
  email: z.string().email({
    message: "Gelieve een geldig e-mailadres in te vullen.",
  }),
  newsletter: z.boolean().default(false),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "Je moet akkoord gaan met de privacyverklaring om verder te gaan.",
  }),
});

interface SubmitFormProps {
  onClose: () => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

export const SubmitForm = ({ onClose, onSubmit }: SubmitFormProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const dialogDescriptionId = "submit-form-description";
  const session = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      newsletter: false,
      privacyConsent: false,
    },
  });

  useEffect(() => {
    const setUserData = async () => {
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email, marketing_consent')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          form.reset({
            name: profile.name || '',
            email: profile.email || '',
            newsletter: profile.marketing_consent || false,
            privacyConsent: false,
          });
        }
      }
    };

    setUserData();
  }, [session, form]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isVerifying) return; // Prevent double-submit
    
    try {
      setIsVerifying(true);
      console.log('Starting submission process with data:', { ...data, email: '***' });

      if (!session?.user) {
        // Create auth user without sending Supabase emails
        const { data: createUserData, error: createUserError } = await supabase.functions.invoke('create-auth-user', {
          body: { 
            email: data.email,
            name: data.name,
            marketing_consent: data.newsletter
          }
        });

        if (createUserError) {
          console.error('Error creating user:', createUserError);
          throw new Error("Failed to create user account");
        }

        // Send verification email using the edge function
        const { data: verificationData, error: verificationError } = await supabase.functions.invoke('send-verification-email', {
          body: { email: data.email, force: true }
        });

        if (verificationError) {
          console.error('Error sending verification email:', verificationError);
          throw new Error("Failed to send verification email");
        }

        // Show appropriate success message based on outcome
        if (verificationData?.outcome === 'already_verified') {
          toast.info("Je e-mailadres is al geverifieerd.");
        } else if (verificationData?.outcome === 'throttled') {
          toast.info("Je hebt recent al een verificatie e-mail ontvangen. Check je inbox.");
        } else if (verificationData?.outcome === 'sent') {
          if (verificationData?.email_id) {
            console.log("Resend email id:", verificationData.email_id);
          }
          toast.success("Check je e-mail om je account te verifiëren.");
        } else if (verificationData?.message === "Verificatie e-mail werd recent al verzonden") {
          toast.info("Je hebt recent al een verificatie e-mail ontvangen. Check je inbox.");
        } else {
          toast.success("Check je e-mail om je account te verifiëren.");
        }
      }

      onSubmit(data);
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast.error(error.message || "Er is iets misgegaan bij het versturen van de verificatie e-mail");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog defaultOpen onOpenChange={onClose}>
      <DialogContent aria-describedby={dialogDescriptionId}>
        <DialogHeader>
          <DialogTitle>Verstuur je hart</DialogTitle>
          <DialogDescription id={dialogDescriptionId}>
            Gelieve onderstaande gegevens in te vullen om jouw hart tekening te versturen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className="space-y-4"
            style={{ pointerEvents: isVerifying ? 'none' : 'auto' }}
          >
            <FormFields form={form} />
            <NewsletterField form={form} />
            <PrivacyConsentField form={form} />
            <FormActions onClose={onClose} isVerifying={isVerifying} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};