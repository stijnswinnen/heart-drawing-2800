import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      subject = "Je hartje is goedgekeurd! 💖";
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F26D85; margin: 0;">Goed nieuws! 🎉</h1>
          </div>
          
          <div style="background: #FFF5F5; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #734439; margin-top: 0;">Hallo ${profile.name || 'daar'},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              We hebben geweldig nieuws! Je hartje is goedgekeurd en staat nu live op onze website voor iedereen om te zien! 💖
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Dank je wel dat je je creativiteit met ons hebt gedeeld. Je bijdrage maakt onze gemeenschap mooier!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7EA672; font-size: 14px; margin: 0;">
              Met liefde,<br>
              Het Heart Team
            </p>
          </div>
        </div>
      `;
    } else {
      subject = "Update over je hartje";
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F26D85; margin: 0;">Update over je hartje</h1>
          </div>
          
          <div style="background: #FFF5F5; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #734439; margin-top: 0;">Hallo ${profile.name || 'daar'},</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Bedankt voor het delen van je hartje met ons. Helaas konden we het deze keer niet goedkeuren.
            </p>
            
            ${reason ? `
            <div style="background: #F2DCE2; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #734439; font-size: 14px; margin: 0;">
                <strong>Reden:</strong> ${reason}
              </p>
            </div>
            ` : ''}
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              We moedigen je aan om opnieuw een hartje te maken en in te sturen!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #7EA672; font-size: 14px; margin: 0;">
              Met vriendelijke groet,<br>
              Het Heart Team
            </p>
          </div>
        </div>
      `;
    }

    // Send email
    const emailResult = await resend.emails.send({
      from: "Hearts <noreply@hearts.be>",
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