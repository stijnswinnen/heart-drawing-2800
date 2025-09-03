import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  name: string;
  marketing_consent?: boolean;
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, marketing_consent = false }: CreateUserRequest = await req.json();
    console.log("Creating auth user for:", email);

    // Create user without sending confirmation email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: crypto.randomUUID(),
      email_confirm: false,
      user_metadata: {
        name,
        marketing_consent,
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw new Error("Failed to create user account");
    }

    if (!authData.user?.id) {
      throw new Error("No user ID returned from user creation");
    }

    // Create or update profile record
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        name: name,
        email: email,
        marketing_consent: marketing_consent,
        email_verified: false,
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      throw new Error("Failed to create user profile");
    }

    console.log("Successfully created auth user and profile for:", email);

    return new Response(JSON.stringify({ 
      user_id: authData.user.id,
      message: "User created successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in create-auth-user function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);