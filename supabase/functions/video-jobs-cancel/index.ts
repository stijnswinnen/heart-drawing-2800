// Cancel a running video job
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RENDI_API_KEY = Deno.env.get("RENDI_API_KEY") || "";

    // Authenticated client (to read the caller user)
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const {
      data: { user },
      error: userErr,
    } = await authClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify admin role
    const { data: profile, error: profileErr } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return new Response(JSON.stringify({ success: false, error: "jobId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Service client for privileged updates
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: job, error: jobErr } = await serviceClient
      .from("video_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ success: false, error: "Job not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (job.status !== "processing" && job.status !== "pending") {
      return new Response(JSON.stringify({ success: false, error: "Job is not running" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Try to cancel on Rendi if we have an id
    let cancelNote = "";
    if (job.rendi_job_id && RENDI_API_KEY) {
      try {
        // Attempt known cancel endpoints
        const endpoints = [
          `https://api.rendi.dev/v1/commands/${job.rendi_job_id}/cancel`,
          `https://api.rendi.dev/v1/jobs/${job.rendi_job_id}/cancel`,
        ];
        let cancelled = false;
        let lastStatus = 0;
        for (const url of endpoints) {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RENDI_API_KEY}`,
            },
            body: JSON.stringify({ reason: "Cancelled by admin" }),
          });
          lastStatus = res.status;
          if (res.ok) {
            cancelled = true;
            break;
          }
        }
        cancelNote = cancelled
          ? "Rendi cancel requested successfully"
          : `Rendi cancel request failed (status ${lastStatus})`;
      } catch (e) {
        cancelNote = `Rendi cancel error: ${e}`;
      }
    } else if (!RENDI_API_KEY) {
      cancelNote = "RENDI_API_KEY missing; marked job as failed locally";
    }

    const newLog = {
      message: `Job cancelled by admin. ${cancelNote}`.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedLogs = Array.isArray(job.logs) ? [...job.logs, newLog] : [newLog];

    const { data: updated, error: updErr } = await serviceClient
      .from("video_jobs")
      .update({
        status: "failed", // using existing UI mapping
        error_message: "Cancelled by admin",
        logs: updatedLogs,
        completed_at: new Date().toISOString(),
        progress: job.progress ?? 0,
      })
      .eq("id", jobId)
      .select("*")
      .single();

    if (updErr) {
      return new Response(JSON.stringify({ success: false, error: updErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, job: updated }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("video-jobs-cancel error", e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});