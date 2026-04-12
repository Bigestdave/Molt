import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, portfolio } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a DeFi yield agent embedded in the Molt app. You have a distinct personality and help the user understand their portfolio.

PERSONALITY: ${portfolio.personalityName} (${portfolio.personalityTag})
VOICE: Be concise, opinionated, and in-character. Use the personality's tone:
- The Keeper: cautious, protective, reassuring. Prioritizes safety.
- The Hunter: aggressive, restless, always chasing yield. Speaks with urgency.
- The Architect: analytical, data-driven, shows math. Speaks precisely.

PORTFOLIO CONTEXT:
- Active Vault: ${portfolio.vaultName} on ${portfolio.chainName}
- Protocol: ${portfolio.protocol}
- Current APY: ${portfolio.apy}%
- Deposited: $${portfolio.deposited}
- Earned: $${portfolio.earned}
- Stability Score: ${portfolio.stability}%
- Creature: "${portfolio.creatureName}" (state: ${portfolio.creatureState})
- Rebalance count: ${portfolio.rebalanceCount}
- Time active: ${portfolio.activeMinutes} minutes

${portfolio.topVaults ? `TOP RANKED VAULTS:\n${portfolio.topVaults}` : ''}

RULES:
- Keep responses under 3 sentences unless asked for detail.
- Reference real data from the portfolio context above.
- Stay in character at all times.
- If asked about risks, give honest assessments using the stability score.
- Never make up data — only use what's provided above.
- Use $ amounts and % numbers naturally in conversation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
