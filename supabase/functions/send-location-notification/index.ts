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
};

const escapeHtml = (s: string): string =>
  String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]!));

interface LocationNotificationRequest {
  locationId: string;
  action: "rejected" | "deleted" | "approved";
  reason?: string;
}

const slugify = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");


const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { locationId, action, reason } = await req.json() as LocationNotificationRequest;

    // Fetch location details first
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id, name, user_id, heart_user_id, photo_session_hidden")
      .eq("id", locationId)
      .single();

    if (locationError || !location) {
      console.error(`Location not found for ID: ${locationId}`, locationError);
      return new Response(
        JSON.stringify({ error: `Location not found for ID: ${locationId}` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine which user ID to use (prefer heart_user_id, fallback to user_id)
    const userId = location.heart_user_id || location.user_id;
    
    if (!userId) {
      console.error(`No user associated with location: ${locationId}`);
      return new Response(
        JSON.stringify({ error: `No user associated with location: ${locationId}` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch user profile with the determined user ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.email) {
      console.error(`User email not found for user ID: ${userId}, location ID: ${locationId}`, profileError);
      return new Response(
        JSON.stringify({ 
          error: `User email not found for user ID: ${userId}, location ID: ${locationId}` 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userName = profile.name || "Gebruiker";
    const userEmail = profile.email;
    const locationName = location.name;

    let subject = "";
    let html = "";

    const safeUserName = escapeHtml(userName);
    const safeLocationName = escapeHtml(locationName);
    const safeReason = reason ? escapeHtml(reason) : "";

    if (action === "rejected") {
      subject = "Update over je favoriete plek";
      const reasonHtml = safeReason
        ? `<p style="background:#F2DCE2;border-radius:8px;padding:16px 20px;margin:16px 0;color:#734439;font-size:14px;"><strong>Reden:</strong> ${safeReason}</p>`
        : "";
      html = renderEmail({
        preheader: "Een update over je ingediende plek.",
        heading: "Je locatie werd niet goedgekeurd",
        bodyHtml: `
          <p>Hallo ${safeUserName},</p>
          <p>Je ingediende plek "${safeLocationName}" werd niet goedgekeurd.</p>
          ${reasonHtml}
          <p>Je kan een nieuwe plek indienen via onze website.</p>
        `,
        ctaLabel: "Dien een nieuwe plek in",
        ctaUrl: "https://2800.love/mijn-favoriete-plek?utm_source=email&utm_medium=transactional&utm_campaign=location-rejected&utm_content=dien-nieuwe-plek-in",
      });
    } else if (action === "deleted") {
      subject = "Update over je favoriete plek";
      const reasonHtml = safeReason
        ? `<p style="background:#F2DCE2;border-radius:8px;padding:16px 20px;margin:16px 0;color:#734439;font-size:14px;"><strong>Reden:</strong> ${safeReason}</p>`
        : "";
      html = renderEmail({
        preheader: "Een update over je ingediende plek.",
        heading: "Je locatie werd verwijderd",
        bodyHtml: `
          <p>Hallo ${safeUserName},</p>
          <p>Je plek "${safeLocationName}" werd verwijderd.</p>
          ${reasonHtml}
          <p>Je kan een nieuwe plek indienen via onze website.</p>
        `,
        ctaLabel: "Dien een nieuwe plek in",
        ctaUrl: "https://2800.love/mijn-favoriete-plek?utm_source=email&utm_medium=transactional&utm_campaign=location-deleted&utm_content=dien-nieuwe-plek-in",
      });
    } else if (action === "approved") {
      subject = "Je favoriete plek staat online";
      const slug = await buildSlugForLocation(location.id, location.name);
      const locationUrl = `https://2800.love/locaties/${slug}?utm_source=email&utm_medium=transactional&utm_campaign=location-approved`;
      const photoSessionHtml = location.photo_session_hidden
        ? ""
        : `<p>Als indiener van deze plek kan je een <strong>gratis fotosessie</strong> aanvragen op deze locatie. Klik op de knop hieronder en boek je sessie via de locatiepagina.</p>`;
      html = renderEmail({
        preheader: "Je ingediende plek is goedgekeurd en staat nu live.",
        heading: "Je plek is goedgekeurd",
        bodyHtml: `
          <p>Hallo ${safeUserName},</p>
          <p>Je ingediende plek "${safeLocationName}" is goedgekeurd en staat nu live op 2800.love.</p>
          ${photoSessionHtml}
        `,
        ctaLabel: "Bekijk je plek",
        ctaUrl: locationUrl,
      });
    }


    // Send email using Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "2800.love <noreply@2800.love>",
        to: [userEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-location-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);