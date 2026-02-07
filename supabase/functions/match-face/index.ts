import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { selfieBase64, foundIdId } = await req.json();

    if (!selfieBase64 || !foundIdId) {
      return new Response(
        JSON.stringify({ error: "Selfie and found ID reference are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Required environment variables are not configured");
    }

    // Fetch the found ID record to get the front photo and AI data
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: foundId, error: fetchError } = await supabase
      .from("found_ids")
      .select("photo_front_url, photo_url, ai_extracted_data")
      .eq("id", foundIdId)
      .maybeSingle();

    if (fetchError || !foundId) {
      return new Response(
        JSON.stringify({ error: "Found ID record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const photoPath = foundId.photo_front_url || foundId.photo_url;
    if (!photoPath) {
      return new Response(
        JSON.stringify({ 
          error: "No ID photo available for comparison",
          match_possible: false 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get a signed URL for the ID photo
    const { data: signedUrlData, error: signError } = await supabase.storage
      .from("id-photos")
      .createSignedUrl(photoPath, 300); // 5 min expiry

    if (signError || !signedUrlData?.signedUrl) {
      console.error("Failed to get signed URL:", signError);
      return new Response(
        JSON.stringify({ error: "Failed to access ID photo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download the ID photo and convert to base64
    const idPhotoResponse = await fetch(signedUrlData.signedUrl);
    const idPhotoBlob = await idPhotoResponse.arrayBuffer();
    const idPhotoBase64 = btoa(
      String.fromCharCode(...new Uint8Array(idPhotoBlob))
    );
    const idPhotoDataUrl = `data:image/jpeg;base64,${idPhotoBase64}`;

    // Use AI to compare the selfie with the ID photo
    const faceDescription = foundId.ai_extracted_data?.face_description || "No prior face description available";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a face comparison AI assistant. You will be shown two images:
1. A selfie photo of a person claiming to own an ID
2. A photo of the ID document which contains a face photo

Your job is to compare the faces and determine if they could be the same person.

Consider:
- Overall facial structure and shape
- Skin tone
- Eye shape and position
- Nose shape
- Mouth and lip shape
- Any distinguishing features

Previous AI face description from the ID: "${faceDescription}"

Return ONLY valid JSON with these fields:
- match_confidence: A number from 0 to 100 indicating confidence they are the same person
- match_level: "high" (80-100), "medium" (50-79), "low" (20-49), or "no_match" (0-19)
- reasoning: A brief explanation of your assessment
- facial_similarities: Array of similarities found
- facial_differences: Array of differences found`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Compare the face in this selfie (first image) with the face on this ID document (second image). Are they the same person?",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: selfieBase64.startsWith("data:")
                      ? selfieBase64
                      : `data:image/jpeg;base64,${selfieBase64}`,
                  },
                },
                {
                  type: "image_url",
                  image_url: {
                    url: idPhotoDataUrl,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Face matching failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let matchResult;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      matchResult = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      matchResult = { 
        match_confidence: 0, 
        match_level: "error", 
        reasoning: "Could not process face comparison",
        parse_error: true 
      };
    }

    return new Response(
      JSON.stringify({ success: true, result: matchResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("match-face error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
