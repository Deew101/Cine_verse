import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const TMDB_BASE = "https://api.themoviedb.org/3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("TMDB_API_KEY");
    if (!apiKey) throw new Error("TMDB_API_KEY not configured");

    const url = new URL(req.url);
    // Path after /tmdb/  ->  e.g. "movie/popular"
    const tmdbPath = url.searchParams.get("path");
    if (!tmdbPath) {
      return new Response(JSON.stringify({ error: "Missing 'path' param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Forward all other params except `path`
    const forwarded = new URLSearchParams();
    url.searchParams.forEach((v, k) => {
      if (k !== "path") forwarded.append(k, v);
    });

    // Detect bearer (v4) vs api key (v3). TMDB v4 tokens start with "eyJ"
    const isBearer = apiKey.startsWith("eyJ");
    if (!isBearer) forwarded.set("api_key", apiKey);

    const target = `${TMDB_BASE}/${tmdbPath.replace(/^\/+/, "")}?${forwarded.toString()}`;

    const tmdbRes = await fetch(target, {
      headers: isBearer
        ? { Authorization: `Bearer ${apiKey}`, accept: "application/json" }
        : { accept: "application/json" },
    });

    const data = await tmdbRes.json();

    return new Response(JSON.stringify(data), {
      status: tmdbRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("TMDB proxy error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
