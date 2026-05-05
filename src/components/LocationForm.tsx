import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LocationMap from "./LocationMap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { MapPin } from "lucide-react";

const formSchema = z.object({
  newsletter: z.boolean().default(false),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "Je moet akkoord gaan met de privacyverklaring om verder te gaan.",
  }),
});

interface LocationFormProps {
  fullWidthMap?: boolean;
}

const inputBase: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 15,
  background: "var(--surface)",
  color: "var(--ink)",
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ink)",
  marginBottom: 8,
  fontFamily: "Inter, system-ui, sans-serif",
};

const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "var(--pink-500)";
  e.currentTarget.style.boxShadow = "0 0 0 3px var(--pink-50)";
};
const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "var(--line-strong)";
  e.currentTarget.style.boxShadow = "none";
};

const SectionHeader = ({ step, title }: { step: string; title: string }) => (
  <div className="flex items-baseline gap-3 mb-5">
    <span
      className="font-serif"
      style={{ fontWeight: 500, color: "var(--pink-500)", fontSize: 18 }}
    >
      {step}
    </span>
    <h2
      className="m-0 font-serif"
      style={{ fontWeight: 400, fontSize: 24, color: "var(--ink)" }}
    >
      {title}
    </h2>
  </div>
);

export const LocationForm = ({ fullWidthMap = false }: LocationFormProps) => {
  const session = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [shareConsent, setShareConsent] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { newsletter: false, privacyConsent: false },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email, marketing_consent")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setName(profile.name || "");
          setEmail(profile.email || "");
          form.reset({
            newsletter: profile.marketing_consent || false,
            privacyConsent: false,
          });
        }
      }
    };
    fetchUserData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formValues = form.getValues();
    const formValidation = await form.trigger();
    if (!formValidation) {
      toast.error("Controleer je gegevens en probeer opnieuw");
      return;
    }
    if (!coordinates) {
      toast.error("Selecteer eerst een locatie op de kaart");
      return;
    }
    if (!locationName.trim()) {
      toast.error("Vul een naam in voor de locatie");
      return;
    }
    if (!description.trim()) {
      toast.error("Vul een beschrijving in voor de locatie");
      return;
    }
    if (!recommendation.trim()) {
      toast.error("Vul een aanbeveling in voor andere Mechelaars");
      return;
    }
    if (!name.trim()) {
      toast.error("Vul je naam in");
      return;
    }
    if (!email.trim()) {
      toast.error("Vul je e-mailadres in");
      return;
    }

    setIsSubmitting(true);

    try {
      let profileId: string;
      let isEmailVerified = false;
      let needsVerification = false;

      if (session?.user?.id) {
        profileId = session.user.id;
        const { data: sessionProfile } = await supabase
          .from("profiles")
          .select("email_verified")
          .eq("id", session.user.id)
          .single();

        await supabase
          .from("profiles")
          .update({ marketing_consent: formValues.newsletter })
          .eq("id", session.user.id);

        isEmailVerified = sessionProfile?.email_verified || false;
        if (!isEmailVerified) needsVerification = true;
      } else {
        const { data: existingProfile, error: profileError } = await supabase.rpc(
          "get_profile_minimal_by_email",
          { p_email: email }
        );
        if (profileError) {
          console.error("Error checking profile:", profileError);
          toast.error("Er ging iets mis bij het controleren van je profiel");
          setIsSubmitting(false);
          return;
        }
        if (existingProfile?.[0]) {
          profileId = existingProfile[0].id;
          isEmailVerified = existingProfile[0].email_verified || false;
          if (!isEmailVerified) needsVerification = true;
        } else {
          const randomPassword = crypto.randomUUID();
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: randomPassword,
            options: {
              data: { name: name.trim(), marketing_consent: formValues.newsletter },
            },
          });
          if (signUpError) {
            console.error("Error creating user:", signUpError);
            toast.error("Er ging iets mis bij het aanmaken van je profiel");
            setIsSubmitting(false);
            return;
          }
          if (!authData.user?.id) {
            toast.error("Er ging iets mis bij het aanmaken van je profiel");
            setIsSubmitting(false);
            return;
          }
          profileId = authData.user.id;
          needsVerification = true;
        }
      }

      if (needsVerification) {
        try {
          const { error: emailError } = await supabase.functions.invoke(
            "send-verification-email",
            { body: { email } }
          );
          if (emailError) console.error("Error sending verification email:", emailError);
        } catch (emailError) {
          console.error("Error sending verification email:", emailError);
        }
      }

      const locationStatus = isEmailVerified ? "new" : "pending_verification";
      const { error } = await supabase.from("locations").insert({
        name: locationName,
        description: description.trim(),
        recommendation: recommendation.trim(),
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        user_id: session?.user?.id || null,
        heart_user_id: profileId,
        share_consent: shareConsent,
        status: locationStatus,
      });

      if (error) throw error;

      if (isEmailVerified) {
        toast.success("Locatie succesvol toegevoegd!");
      } else {
        toast.success(
          "Verificatie e-mail verzonden. Je locatie staat in de wacht tot je e-mailadres is bevestigd."
        );
      }

      setLocationName("");
      setDescription("");
      setRecommendation("");
      setCoordinates(null);
      setShareConsent(false);
      form.reset({ newsletter: false, privacyConsent: false });

      if (!session) {
        setName("");
        setEmail("");
      }
    } catch (error: any) {
      console.error("Error submitting location:", error);
      toast.error("Er ging iets mis bij het toevoegen van de locatie");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionStyle: React.CSSProperties = {
    paddingTop: 32,
    paddingBottom: 32,
    borderBottom: "1px solid var(--line)",
  };
  const lastSectionStyle: React.CSSProperties = {
    paddingTop: 32,
    paddingBottom: 0,
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        {/* Section 01 */}
        <section style={{ ...sectionStyle, paddingTop: 0 }}>
          <SectionHeader step="01" title="Wie ben je?" />
          <div className="grid gap-[18px] md:grid-cols-2">
            <div>
              <label htmlFor="name" style={labelStyle}>Jouw naam</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vul je naam in"
                required
                style={inputBase}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>Jouw e-mailadres</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.be"
                required
                style={inputBase}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>
          </div>
        </section>

        {/* Section 02 */}
        <section style={sectionStyle}>
          <SectionHeader step="02" title="Waar is het?" />
          <div className="mb-5">
            <label htmlFor="locationName" style={labelStyle}>Naam van de locatie</label>
            <input
              id="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Geef deze plek een naam"
              required
              style={inputBase}
              onFocus={focusOn}
              onBlur={focusOff}
            />
          </div>
          <label style={labelStyle}>Pin op de kaart</label>
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              overflow: "hidden",
              background: "var(--surface)",
            }}
          >
            <div
              className="flex items-center gap-2"
              style={{
                padding: "12px 16px",
                background: "var(--bg)",
                borderBottom: "1px solid var(--line)",
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              <MapPin size={14} />
              <span>Sleep de pin naar de plek die je wilt delen</span>
            </div>
            <div style={{ height: 320 }}>
              <LocationMap onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
            </div>
          </div>
        </section>

        {/* Section 03 */}
        <section style={sectionStyle}>
          <SectionHeader step="03" title="Het verhaal" />
          <div className="mb-5">
            <label htmlFor="description" style={labelStyle}>
              Waarom is dit jouw lievelingsplek?
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="bvb: ik hou van deze plaats omdat ik hier tot rust kom..."
              required
              style={{ ...inputBase, minHeight: 110, lineHeight: 1.55, resize: "vertical" }}
              onFocus={focusOn}
              onBlur={focusOff}
            />
          </div>
          <div>
            <label htmlFor="recommendation" style={labelStyle}>
              Waarom moeten andere Mechelaars hier ook eens komen?
            </label>
            <textarea
              id="recommendation"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Vertel waarom anderen deze plek ook zouden moeten ontdekken..."
              required
              style={{ ...inputBase, minHeight: 110, lineHeight: 1.55, resize: "vertical" }}
              onFocus={focusOn}
              onBlur={focusOff}
            />
          </div>
        </section>

        {/* Section 04 - checkboxes */}
        <section style={lastSectionStyle}>
          <div className="space-y-3">
            <label className="flex items-start gap-3" style={{ fontSize: 14, color: "var(--ink-2)" }}>
              <input
                type="checkbox"
                checked={form.watch("newsletter")}
                onChange={(e) => form.setValue("newsletter", e.target.checked)}
                disabled={isSubmitting}
                style={{ width: 16, height: 16, accentColor: "var(--pink-500)", marginTop: 3 }}
              />
              <span>Ik wil graag op de hoogte blijven van nieuws en updates.</span>
            </label>
            <label className="flex items-start gap-3" style={{ fontSize: 14, color: "var(--ink-2)" }}>
              <input
                type="checkbox"
                checked={form.watch("privacyConsent")}
                onChange={(e) => form.setValue("privacyConsent", e.target.checked, { shouldValidate: true })}
                style={{ width: 16, height: 16, accentColor: "var(--pink-500)", marginTop: 3 }}
              />
              <span>
                Ik heb kennisgenomen van de{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--pink-600)", textDecoration: "underline" }}
                >
                  privacyverklaring
                </a>{" "}
                en ga hiermee akkoord.
              </span>
            </label>
            {form.formState.errors.privacyConsent && (
              <p style={{ fontSize: 13, color: "var(--pink-600)" }}>
                {form.formState.errors.privacyConsent.message as string}
              </p>
            )}
          </div>

          {/* Submit row */}
          <div
            className="flex flex-wrap items-center gap-4"
            style={{ paddingTop: 28 }}
          >
            <button
              type="submit"
              disabled={isSubmitting || !coordinates}
              className="inline-flex items-center justify-center rounded-full font-sans font-medium transition-colors disabled:opacity-60"
              style={{
                height: 52,
                padding: "0 26px",
                fontSize: 15,
                background: "var(--pink-500)",
                color: "var(--surface)",
                border: "1px solid var(--pink-500)",
              }}
              onMouseEnter={(e) => {
                if (e.currentTarget.disabled) return;
                e.currentTarget.style.background = "var(--pink-600)";
                e.currentTarget.style.borderColor = "var(--pink-600)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--pink-500)";
                e.currentTarget.style.borderColor = "var(--pink-500)";
              }}
            >
              {isSubmitting ? "Bezig met versturen..." : "Deel jouw favoriete plaats"}
            </button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              We gebruiken je gegevens enkel om met je contact op te nemen.
            </span>
          </div>
        </section>
      </form>
    </Form>
  );
};
