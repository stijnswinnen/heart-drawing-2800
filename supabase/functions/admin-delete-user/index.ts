import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (callerProfile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { profileId } = await req.json();
    if (!profileId || typeof profileId !== "string") {
      return new Response(JSON.stringify({ error: "Missing profileId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the profile to find linked auth user
    const { data: profile } = await admin
      .from("profiles")
      .select("id, user_id")
      .eq("id", profileId)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Preserve hearts and locations by detaching them from the profile/user
    await admin
      .from("drawings")
      .update({ heart_user_id: null, user_id: null })
      .or(`heart_user_id.eq.${profile.id}${profile.user_id ? `,user_id.eq.${profile.user_id}` : ""}`);

    await admin
      .from("locations")
      .update({ heart_user_id: null, user_id: null })
      .or(`heart_user_id.eq.${profile.id}${profile.user_id ? `,user_id.eq.${profile.user_id}` : ""}`);

    // Delete profile
    const { error: delProfileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", profile.id);
    if (delProfileError) throw delProfileError;

    // Delete auth user if linked
    if (profile.user_id) {
      await admin.auth.admin.deleteUser(profile.user_id);
    }

    await admin.from("security_logs").insert({
      event_type: "admin_user_delete",
      user_id: userData.user.id,
      details: { deleted_profile_id: profile.id, deleted_auth_user_id: profile.user_id },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-delete-user error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
