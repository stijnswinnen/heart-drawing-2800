import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  locationId: string;
  action: "rejected" | "deleted";
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { locationId, action, reason } = await req.json() as EmailRequest;

    // Fetch location and user details
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("*, profiles(email, name)")
      .eq("id", locationId)
      .single();

    if (locationError) {
      throw locationError;
    }

    if (!location?.profiles?.email) {
      throw new Error("User email not found");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    const actionText = action === "rejected" ? "afgekeurd" : "verwijderd";
    const subject = `Je locatie is ${actionText}`;
    
    let html = `
      <p>Beste ${location.profiles.name || "gebruiker"},</p>
      <p>Je ingediende locatie "${location.name}" is ${actionText}.</p>
    `;

    if (action === "rejected" && reason) {
      html += `
        <p>Reden voor afkeuring:</p>
        <p>${reason}</p>
        <p>Je kunt de locatie aanpassen en opnieuw indienen via je profiel pagina.</p>
      `;
    }

    html += `
      <p>Met vriendelijke groet,<br>Het team van Mechelen Hartverwarmend</p>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mechelen Hartverwarmend <noreply@mechelen-hartverwarmend.be>",
        to: [location.profiles.email],
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-location-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});