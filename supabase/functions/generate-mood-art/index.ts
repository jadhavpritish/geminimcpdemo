// Default model if not specified
const DEFAULT_MODEL = "gemini-2.0-flash-exp-image-generation";
Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
    const { mood, additionalDetails } = await req.json();
    if (!mood) {
      throw new Error("Mood is required");
    }
    // Construct the prompt for Gemini image generation
    const prompt = `Generate an image that reflects the user's current mood: ${mood}${additionalDetails ? `. Additional context: ${additionalDetails}` : ""}`;
    // Call the Gemini API through PICA passthrough endpoint
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/models/gemini-2.0-flash-exp-image-generation:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_GEMINI_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCmd5BQE388::PISTzTbvRSqXx0N0rMa-Lw",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    // Extract generated content from candidates
    const generatedContent = data.candidates?.[0] || null;
    if (!generatedContent) {
      throw new Error("No generated content returned from Gemini API.");
    }
    // Extract the art description from the generated content
    const artDescription = generatedContent.content?.parts?.[0]?.text || "";
    const result = {
      artDescription,
      generatedContent,
    };
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error) {
    const errorResponse = {
      artDescription: "",
      error: error.message,
    };
    return new Response(JSON.stringify(errorResponse), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400,
    });
  }
});
