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

    console.log('Processing request for location:', locationId, 'action:', action);

    // First fetch the location
    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("*, heart_user_id")
      .eq("id", locationId)
      .single();

    if (locationError) {
      console.error('Error fetching location:', locationError);
      throw locationError;
    }

    if (!location) {
      throw new Error("Location not found");
    }

    // Then fetch the profile using heart_user_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", location.heart_user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    if (!profile?.email) {
      throw new Error("User email not found");
    }

    console.log('Found profile:', profile);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    const actionText = action === "rejected" ? "afgekeurd" : "verwijderd";
    const subject = `Je locatie is ${actionText}`;
    
    let html = `
      <p>Beste ${profile.name || "gebruiker"},</p>
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

    console.log('Sending email to:', profile.email);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mechelen Hartverwarmend <noreply@mechelen-hartverwarmend.be>",
        to: [profile.email],
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error('Error from Resend:', errorText);
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