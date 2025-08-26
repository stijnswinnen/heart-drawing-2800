import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LocationNotificationRequest {
  locationId: string;
  action: "rejected" | "deleted";
  reason?: string;
}

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
      .select("id, name, user_id, heart_user_id")
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

    if (action === "rejected") {
      subject = `Je locatie "${locationName}" werd niet goedgekeurd`;
      html = `
        <p>Beste ${userName},</p>
        <p>Je ingediende locatie "${locationName}" werd niet goedgekeurd om de volgende reden:</p>
        <p>${reason}</p>
        <p>Je kan een nieuwe locatie indienen via onze website.</p>
        <p>Met vriendelijke groeten,<br>Het 2800.Love team</p>
      `;
    } else if (action === "deleted") {
      subject = `Je locatie "${locationName}" werd verwijderd`;
      html = `
        <p>Beste ${userName},</p>
        <p>Je ingediende locatie "${locationName}" werd verwijderd${
        reason ? ` om de volgende reden:</p><p>${reason}</p>` : ".</p>"
      }
        <p>Je kan een nieuwe locatie indienen via onze website.</p>
        <p>Met vriendelijke groeten,<br>Het 2800.Love team</p>
      `;
    }

    // Send email using Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "2800.Love <heart@stijnswinnen.be>",
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