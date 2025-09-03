import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let to = "";

    if (req.method === "GET") {
      const url = new URL(req.url);
      to = url.searchParams.get("to") ?? "";
    } else if (req.method === "POST") {
      const body: TestEmailRequest = await req.json().catch(() => ({} as TestEmailRequest));
      to = body.to ?? "";
    } else {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY secret");
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!to) {
      return new Response(JSON.stringify({ error: "Missing 'to' email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Sending test email via Resend to:", to);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "delivered@resend.dev",
        to: [to],
        subject: "Test e-mail vanaf delivered@resend.dev",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
            <h2 style="margin:0 0 12px;">Test e-mail</h2>
            <p>Dit is een testbericht verzonden via Resend vanaf <strong>delivered@resend.dev</strong>.</p>
            <p style="color:#666; font-size:12px;">Verzendtijd: ${new Date().toISOString()}</p>
          </div>
        `,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Resend API error:", text);
      return new Response(JSON.stringify({ error: "Resend error", details: text }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Resend API response:", text);
    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("Unhandled error in send-test-email:", err?.message || err);
    return new Response(JSON.stringify({ error: err?.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
