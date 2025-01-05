import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { FormFields } from "./form/FormFields";
import { FormActions } from "./form/FormActions";
import { NewsletterField } from "./form/NewsletterField";
import { PrivacyConsentField } from "./form/PrivacyConsentField";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      newsletter: false,
      privacyConsent: false,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsVerifying(true);
      console.log('Starting submission process with data:', data);

      const { error: upsertError } = await supabase
        .from("heart_users")
        .upsert({
          email: data.email,
          name: data.name,
          marketing_consent: data.newsletter,
        }, {
          onConflict: 'email'
        });

      if (upsertError) {
        console.error('Error upserting heart_user:', upsertError);
        throw new Error("Failed to create user record");
      }

      const { data: existingUser } = await supabase
        .from("heart_users")
        .select("email_verified")
        .eq("email", data.email)
        .maybeSingle();

      if (!existingUser?.email_verified) {
        console.log('Email not verified, sending verification email');
        const response = await supabase.functions.invoke("send-verification-email", {
          body: { email: data.email },
        });

        if (response.error) {
          console.error('Error sending verification email:', response.error);
          throw new Error(response.error.message || "Failed to send verification email");
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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