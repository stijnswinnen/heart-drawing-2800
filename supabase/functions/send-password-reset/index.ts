import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderEmail } from "../_shared/email-template.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const GENERIC_RESPONSE = {
  success: true,
  message:
    "Als er een account bestaat met dit e-mailadres, ontvang je zo dadelijk een e-mail met instructies.",
};

const isValidEmail = (email: unknown): email is string =>
  typeof email === "string" &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const respondGeneric = () =>
    new Response(JSON.stringify(GENERIC_RESPONSE), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body ?? {};

    if (!isValidEmail(email)) {
      // Return generic to avoid enumeration / probing
      return respondGeneric();
    }

    // Hardcoded allowlist of trusted origins to prevent open-redirect token theft.
    // Never derive the reset link origin from caller-controlled input (body or headers).
    const ALLOWED_ORIGINS = [
      "https://2800.love",
      "https://heart-drawing-2800.lovable.app",
    ];
    const resetRedirect = `${ALLOWED_ORIGINS[0]}/reset-password`;

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: resetRedirect },
    });

    if (error || !data?.properties?.action_link) {
      console.log("generateLink result", {
        email,
        error: error?.message,
        hasLink: !!data?.properties?.action_link,
      });
      // Still return generic — typical reason: user does not exist
      return respondGeneric();
    }

    const tokenHash = data.properties.hashed_token;
    const actionLink = data.properties.action_link;
    const resetLink =
      typeof tokenHash === "string" && tokenHash.length > 0
        ? `${resetRedirect}?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`
        : actionLink;

    // Look up profile name (best-effort; falls back to "gebruiker")
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("email", email)
      .maybeSingle();
    const safeName = (profile?.name || "gebruiker")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const ctaUrl = `${resetLink}${resetLink.includes("?") ? "&" : "?"}utm_source=email&utm_medium=transactional&utm_campaign=password-reset&utm_content=reset-wachtwoord`;

    const html = renderEmail({
      preheader: "Reset je wachtwoord voor je 2800.love account.",
      heading: "Reset je wachtwoord",
      bodyHtml: `
        <p>Hallo ${safeName},</p>
        <p>Je ontving deze mail omdat er een wachtwoord reset werd aangevraagd voor je 2800.love account.</p>
      `,
      ctaLabel: "Reset wachtwoord",
      ctaUrl,
      footerNote: `Werkt de knop niet? Kopieer dan deze link in je browser: ${ctaUrl}<br>Deze link is 1 uur geldig. Heb je geen reset aangevraagd? Dan kan je deze mail negeren.`,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "2800.love <noreply@2800.love>",
        to: [email],
        subject: "Reset je wachtwoord",
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error", res.status, errText);
    }

    return respondGeneric();
  } catch (err) {
    console.error("send-password-reset error", err);
    // Always generic to avoid info leak
    return respondGeneric();
  }
};

serve(handler);
