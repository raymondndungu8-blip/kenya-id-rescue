import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  found_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client for user validation
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for admin operations (fetching reporter email)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { found_id }: NotifyRequest = await req.json();

    if (!found_id) {
      return new Response(
        JSON.stringify({ error: "found_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the found ID details including reporter info using service role
    const { data: foundIdData, error: foundIdError } = await supabaseAdmin
      .from("found_ids")
      .select("id_type, name_on_id, location_found, reporter_id, contact_email")
      .eq("id", found_id)
      .single();

    if (foundIdError || !foundIdData) {
      console.error("Error fetching found ID:", foundIdError);
      return new Response(
        JSON.stringify({ error: "Found ID not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get reporter's email from auth.users using admin client
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      foundIdData.reporter_id
    );

    if (userError || !userData?.user?.email) {
      console.error("Error fetching reporter email:", userError);
      // Don't fail the request, just log the issue
      return new Response(
        JSON.stringify({ success: true, message: "Email notification skipped - no email found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reporterEmail = userData.user.email;
    const idType = foundIdData.id_type;
    const nameOnId = foundIdData.name_on_id || "Unknown";
    const location = foundIdData.location_found;

    // Send email notification using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ID Mkononi <onboarding@resend.dev>",
        to: [reporterEmail],
        subject: "New Verification Request for Your Found ID Report",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Verification Request</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="margin-top: 0;">Hello,</p>
              
              <p>Someone has submitted a verification request for the ID you reported finding:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>ID Type:</strong> ${idType}</p>
                <p style="margin: 0 0 10px 0;"><strong>Name on ID:</strong> ${nameOnId}</p>
                <p style="margin: 0;"><strong>Location Found:</strong> ${location}</p>
              </div>
              
              <p>Please log in to your dashboard to review and respond to this request.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get("SITE_URL") || "https://id-preview--3681fa05-7a76-4952-b266-5189e4448853.lovable.app"}/dashboard" 
                   style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Request
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                Thank you for helping reunite people with their lost IDs!<br>
                <strong>ID Mkononi Team</strong>
              </p>
            </div>
            
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
              This email was sent because someone requested verification for an ID you reported.
            </p>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Error sending email:", emailData);
      // Don't fail the request, just log the issue
      return new Response(
        JSON.stringify({ success: true, message: "Email notification failed but request processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-verification-request function:", error);
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
