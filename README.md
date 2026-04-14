
# Molt — YieldPet

> Your yield, alive.


## What is Molt?

Molt is a DeFi yield management app where an AI agent 
with a chosen personality manages your vault positions 
via the LI.FI Earn API. Your portfolio is visualized 
as a living creature whose health, energy, and evolution 
directly reflect your real yield performance.

This is not a dashboard. It is not a copilot. 
It is a yield agent that acts — and a portfolio 
you can feel.

**Live app:** https://agentmolt.live  
**Track:** 🎨 AI x DeFi Challenge  
**Hackathon:** DeFi Mullet #1 (Builder Edition)

---

## The Problem

Most people do not manage their DeFi yield actively.
Not because they do not care — because it is 
exhausting and abstract.

Numbers on a screen do not create urgency.
A faceless algorithm does not create trust.
Protocol-hopping does not create confidence.

Molt solves all three.

---

## The Solution

### 1. Agent Personalities
Instead of a risk slider, you choose an agent with 
a character. The personality changes the actual 
rebalancing algorithm — not just the UI APY


** The Keeper** — Conservative  
Prioritizes APY stability over peak yield.  
`Score = stability × 0.65 + APY × 0.35`  
Moves when stability > 0.65 AND APY > 15% higher

** The Hunter** — Aggressive  
Pure APY maximizer. Moves fast when opportunity appears.  
`Score = APY (pure)`  
Moves when any vault offers > 1.5× current APY

** The Architect** — Analytical  
Composite risk-adjusted scoring. Shows its math.  
`Score = APY × stability`  
Moves when composite score is 20% higher

### 2. Yield Volatility as a Signal
Molt does not just look at current APY.
It tracks APY stability over time — a vault 
advertising 12% that swings between 3% and 20% 
weekly is treated differently from one holding 
steady at 8%. This is the rebalancing signal 
most yield products ignore.

### 3. The Living Creature
Your portfolio is visualized as a procedurally 
animated canvas creature. Its energy level, 
animation speed, and visual state map directly 
to real yield health:

- Deposit → creature hatches
- APY healthy → creature thrives, energy ring appears
- Agent rebalances → creature evolves
- Yield drops → creature visibly weakens

This is not decoration. The creature IS the dashboard.

---

## How It Uses LI.FI Earn

| Integration Point | LI.FI Endpoint Used |
|---|---|
| Vault discovery | `GET /v1/earn/vaults` |
| Chain filtering | `GET /v1/earn/chains` |
| Protocol listing | `GET /v1/earn/protocols` |
| Portfolio tracking | `GET /v1/earn/portfolio/{address}/positions` |
| Deposit execution | Composer `GET /v1/quote` |

The full deposit flow uses LI.FI Composer to handle 
swap + bridge + deposit in a single transaction. 
Users enter any vault from any token on any chain 
with one click.




---

## Tech Stack

- **Frontend:** HTML / Canvas2D / Vanilla JS
- **Yield Data:** LI.FI Earn API
- **Execution:** LI.FI Composer API
- **Creature:** Procedural Canvas2D blob animation
- **Fonts:** Syne + DM Mono


What I Would Build Next
	∙	Multi-position portfolio (multiple creatures)
	∙	APY history database for true volatility scoring
	∙	Mobile app — the creature mechanic is perfect
for a home screen widget
	∙	Social layer — share your creature’s evolution

Feedback on the LI.FI Earn API
The vault discovery and standardized schema made
building fast. The biggest unlock was Composer,
abstracting swap + bridge + deposit into one call
is what made the one-click UX actually possible.
One request: a historical APY endpoint would
significantly improve volatility-based rebalancing logic. Right now I simulate history. Real data would make the Architect personality significantlysmarter.

Team
Dave — Founding Builder & Creative Director
18 years old, Nigeria

Building: Molt, LCU Prep, Citeable
Twitter: @systemthinkersx
Live app: https://agentmolt.liveRepo: https://github.com/bigestdave/
