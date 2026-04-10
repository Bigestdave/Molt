import { corsHeaders } from "@supabase/supabase-js/cors";

const EARN_BASE = "https://earn.li.fi";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const LIFI_API_KEY = Deno.env.get("LIFI_API_KEY");
  if (!LIFI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "LIFI_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    if (!path) {
      return new Response(
        JSON.stringify({ error: "Missing 'path' query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate path starts with /v1/earn
    if (!path.startsWith("/v1/earn")) {
      return new Response(
        JSON.stringify({ error: "Invalid path — must start with /v1/earn" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward remaining query params (exclude 'path')
    const forwardParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== "path") forwardParams.set(key, value);
    });

    const targetUrl = `${EARN_BASE}${path}${forwardParams.toString() ? "?" + forwardParams.toString() : ""}`;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "x-lifi-api-key": LIFI_API_KEY,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      ...(req.method !== "GET" && req.method !== "HEAD" ? { body: await req.text() } : {}),
    });

    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: {
        ...corsHeaders,
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("LI.FI proxy error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
