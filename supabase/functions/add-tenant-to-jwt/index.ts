/**
 * Supabase Edge Function: Add Tenant to JWT
 * 
 * This function is triggered by Supabase Auth hooks and adds tenant context
 * to JWT claims. This eliminates the need for pathname/referer-based role detection.
 * 
 * Setup:
 * 1. Deploy this function to Supabase
 * 2. Configure it as an Auth hook in Supabase Dashboard
 * 3. Set trigger: auth.users INSERT/UPDATE
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the auth user from the request
    const { record } = await req.json();
    const authUserId = record.id;

    if (!authUserId) {
      return new Response(
        JSON.stringify({ error: "Missing auth user ID" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user info from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, role, account_status, email")
      .or(`id.eq.${authUserId},auth_user_id.eq.${authUserId}`)
      .order("role", { ascending: true }) // Prioritize ADMIN, DIETITIAN, THERAPIST, USER
      .limit(1)
      .single();

    if (userError || !userData) {
      console.warn("User not found in database:", authUserId);
      // Return without error - user might be created later
      return new Response(
        JSON.stringify({ message: "User not found, will be created later" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update auth.users metadata with tenant info
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      {
        user_metadata: {
          tenant_id: userData.id,
          user_role: userData.role,
          account_status: userData.account_status,
          app_user_id: userData.id,
        },
      }
    );

    if (updateError) {
      console.error("Error updating user metadata:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update user metadata" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Tenant context added to JWT",
        tenant_id: userData.id,
        role: userData.role,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in add-tenant-to-jwt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

