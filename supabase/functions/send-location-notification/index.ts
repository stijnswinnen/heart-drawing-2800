import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LocationNotification {
  name: string;
  email: string;
  locationName: string;
  description: string;
  latitude: number;
  longitude: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const locationData: LocationNotification = await req.json();
    console.log("Received location notification data:", locationData);

    const submissionDate = new Date().toLocaleString('nl-BE', { 
      timeZone: 'Europe/Brussels',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "2800.love <notify@2800.love>",
        to: ["anendel@gmail.com"],
        subject: `Nieuwe favoriete plek: ${locationData.locationName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Nieuwe favoriete plek ingediend</h2>
            
            <p><strong>Ingediend op:</strong> ${submissionDate}</p>
            
            <h3>Gebruiker</h3>
            <p><strong>Naam:</strong> ${locationData.name}</p>
            <p><strong>Email:</strong> ${locationData.email}</p>
            
            <h3>Locatie</h3>
            <p><strong>Naam:</strong> ${locationData.locationName}</p>
            <p><strong>Beschrijving:</strong> ${locationData.description}</p>
            <p><strong>Coördinaten:</strong> ${locationData.latitude}, ${locationData.longitude}</p>
            
            <p style="margin-top: 30px;">
              <a href="https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Bekijk op Google Maps
              </a>
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-location-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);