import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { email, redirectTo } = body ?? {};

    if (!isValidEmail(email)) {
      // Return generic to avoid enumeration / probing
      return respondGeneric();
    }

    const origin =
      (typeof redirectTo === "string" && redirectTo.startsWith("http")
        ? new URL(redirectTo).origin
        : req.headers.get("origin")) || "https://2800.love";
    const resetRedirect = `${origin}/reset-password`;

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

    const actionLink = data.properties.action_link;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111;">
        <h1 style="font-size: 22px; margin: 0 0 16px;">Reset je wachtwoord</h1>
        <p style="font-size: 15px; line-height: 1.5;">
          Je ontving deze e-mail omdat er een wachtwoord reset werd aangevraagd voor je 2800.love account.
        </p>
        <p style="margin: 24px 0;">
          <a href="${actionLink}"
             style="background: #F26D85; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reset wachtwoord
          </a>
        </p>
        <p style="font-size: 13px; color: #555; line-height: 1.5;">
          Werkt de knop niet? Kopieer dan deze link in je browser:<br/>
          <a href="${actionLink}" style="color: #F26D85; word-break: break-all;">${actionLink}</a>
        </p>
        <p style="font-size: 13px; color: #555; line-height: 1.5; margin-top: 24px;">
          Deze link is 1 uur geldig. Heb je geen reset aangevraagd? Dan kan je deze e-mail negeren.
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 32px;">— 2800.love</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "2800.love <noreply@2800.love>",
        to: [email],
        subject: "Reset je wachtwoord · 2800.love",
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
