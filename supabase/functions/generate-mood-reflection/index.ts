import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
      status: 200,
    });
  }
  try {
    const { mood } = await req.json();
    if (!mood) {
      throw new Error("Mood is required");
    }
    // Call Gemini API via Pica passthrough
    const url =
      "https://api.picaos.com/v1/passthrough/models/gemini-1.5-flash:generateContent";
    const headers = {
      "Content-Type": "application/json",
      "x-pica-secret": Deno.env.get("PICA_SECRET_KEY"),
      "x-pica-connection-key": Deno.env.get("PICA_GEMINI_CONNECTION_KEY"),
      "x-pica-action-id": "conn_mod_def::GCmd5BQE388::PISTzTbvRSqXx0N0rMa-Lw",
    };
    const data = {
      contents: [
        {
          parts: [
            {
              text: `Generate a short, uplifting journal entry or affirmation for someone feeling ${mood}.`,
            },
          ],
        },
      ],
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error("No reflection generated");
    }
    const reflection = result.candidates[0].content.parts[0].text;
    return new Response(
      JSON.stringify({
        reflection,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error generating mood reflection:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate mood reflection",
        reflection: "",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      },
    );
  }
});
