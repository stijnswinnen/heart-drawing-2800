import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";
import { Resend } from "npm:resend@6.12.2";
import { renderEmail } from "../_shared/email-template.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (s: string): string =>
  String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]!));

interface HeartNotificationRequest {
  drawingId: string;
  action: "approved" | "rejected";
  reason?: string;
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
const resend = new Resend(resendApiKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawingId, action, reason }: HeartNotificationRequest = await req.json();

    console.log("Processing heart notification:", { drawingId, action });

    // Get drawing details
    const { data: drawing, error: drawingError } = await supabase
      .from("drawings")
      .select("heart_user_id, user_id")
      .eq("id", drawingId)
      .single();

    if (drawingError || !drawing) {
      console.error("Drawing not found:", drawingError);
      return new Response(
        JSON.stringify({ error: "Drawing not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Determine which user ID to use (prioritize heart_user_id)
    const userId = drawing.heart_user_id || drawing.user_id;
    
    if (!userId) {
      console.error("No user ID found for drawing");
      return new Response(
        JSON.stringify({ error: "No user associated with drawing" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("User profile not found:", profileError);
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Prepare email content based on action
    let subject: string;
    let htmlContent: string;

    if (action === "approved") {
      subject = "Je hartje staat online";
      const ctaUrl = `https://2800.love/hearts/${encodeURIComponent(drawingId)}?utm_source=email&utm_medium=transactional&utm_campaign=heart-approved&utm_content=bekijk-hartje`;
      htmlContent = renderEmail({
        preheader: "Goed nieuws — je hartje staat live op 2800.love!",
        heading: "Je hartje staat online 💖",
        bodyHtml: `
          <p>Hallo ${escapeHtml(profile.name || "daar")},</p>
          <p>Goed nieuws — je hartje is goedgekeurd en staat nu live op 2800.love. Bedankt dat je je creativiteit deelt. Je bijdrage maakt onze kaart mooier!</p>
        `,
        ctaLabel: "Bekijk je hartje",
        ctaUrl,
      });
    } else {
      subject = "Update over je hartje";
      const reasonHtml = reason
        ? `<p style="background:#F2DCE2;border-radius:8px;padding:16px 20px;margin:16px 0;color:#734439;font-size:14px;"><strong>Reden:</strong> ${escapeHtml(reason)}</p>`
        : "";
      htmlContent = renderEmail({
        preheader: "Een update over je ingediende hartje.",
        heading: "Update over je hartje",
        bodyHtml: `
          <p>Hallo ${escapeHtml(profile.name || "daar")},</p>
          <p>Bedankt voor het delen van je hartje. Helaas konden we het niet goedkeuren.</p>
          ${reasonHtml}
          <p>Je bent van harte welkom om opnieuw een hartje te tekenen!</p>
        `,
        ctaLabel: "Teken een nieuw hartje",
        ctaUrl: "https://2800.love/?utm_source=email&utm_medium=transactional&utm_campaign=heart-rejected&utm_content=teken-nieuw-hartje",
      });
    }

    // Send email
    const emailResult = await resend.emails.send({
      from: "2800.love <noreply@2800.love>",
      to: [profile.email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-heart-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);