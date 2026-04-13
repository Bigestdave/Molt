import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Syne";
import { loadFont as loadDmMono } from "@remotion/google-fonts/DMMono";

const { fontFamily: syneFontFamily } = loadFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});

const { fontFamily: monoFontFamily } = loadDmMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const DashboardScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene enter
  const enterScale = spring({ frame, fps, config: { damping: 25, stiffness: 80 } });

  // Creature breathing
  const creatureScale = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.95, 1.05]
  );

  // APY counter animation
  const apyValue = interpolate(frame, [30, 90], [0, 16.64], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Earned counter
  const earnedValue = interpolate(frame, [60, 300], [0, 0.042718], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Agent log messages
  const logs = [
    { text: "Scanning for higher yield...", delay: 80 },
    { text: "Found vault at 2.3× current APY — TVL thin. Watching.", delay: 160 },
    { text: "Checked bridge costs to 4 chains. Arb → Base cheapest.", delay: 250 },
    { text: "Current position leaving ~$0.12/day on the table.", delay: 340 },
    { text: "Rate arbitrage widening. Interesting.", delay: 430 },
  ];

  // Vitals bars
  const vitals = [
    { label: "YIELD", value: 82, color: "#f97316" },
    { label: "STABILITY", value: 65, color: "#fbbf24" },
    { label: "ACTIVITY", value: 74, color: "#f97316" },
  ];

  // Rebalance alert at frame 400
  const rebalanceShow = frame > 380;
  const rebalanceOpacity = interpolate(frame, [380, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rebalanceScale = spring({ frame: frame - 380, fps, config: { damping: 15, stiffness: 100 } });

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        transform: `scale(${interpolate(enterScale, [0, 1], [0.95, 1])})`,
        opacity: interpolate(enterScale, [0, 1], [0, 1]),
      }}>
        {/* LEFT PANEL — Creature */}
        <div style={{
          width: 500,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          position: "relative",
        }}>
          {/* Creature glow */}
          <div style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }} />

          {/* Creature visual — abstract orb */}
          <div style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 40%, rgba(249,115,22,0.4) 0%, rgba(249,115,22,0.1) 50%, transparent 70%)",
            border: "2px solid rgba(249,115,22,0.3)",
            boxShadow: "0 0 60px rgba(249,115,22,0.2), inset 0 0 40px rgba(249,115,22,0.1)",
            transform: `scale(${creatureScale})`,
            marginBottom: 24,
          }}>
            {/* Eyes */}
            <div style={{
              display: "flex",
              gap: 30,
              justifyContent: "center",
              paddingTop: 70,
            }}>
              <div style={{ width: 12, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.8)" }} />
              <div style={{ width: 12, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.8)" }} />
            </div>
          </div>

          {/* Creature name */}
          <div style={{
            fontFamily: monoFontFamily,
            fontSize: 10,
            letterSpacing: 3,
            color: "rgba(249,115,22,0.6)",
            textTransform: "uppercase",
            marginBottom: 4,
            padding: "4px 12px",
            borderRadius: 8,
            background: "rgba(249,115,22,0.08)",
            border: "1px solid rgba(249,115,22,0.2)",
          }}>THRIVING</div>
          <div style={{
            fontFamily: syneFontFamily,
            fontWeight: 800,
            fontSize: 28,
            color: "white",
            letterSpacing: -1,
            marginTop: 8,
          }}>Voltix</div>

          {/* Active position */}
          <div style={{
            marginTop: 30,
            padding: "16px 24px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            width: "100%",
            maxWidth: 320,
          }}>
            <div style={{ fontFamily: monoFontFamily, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>ACTIVE POSITION</div>
            <div style={{ fontFamily: syneFontFamily, fontWeight: 700, fontSize: 15, color: "white" }}>USDC • Base</div>
            <div style={{ fontFamily: monoFontFamily, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Yo Protocol • 16.64% APY</div>
          </div>

          {/* Deposited amount */}
          <div style={{
            marginTop: 16,
            padding: "20px 24px",
            borderRadius: 14,
            background: "rgba(249,115,22,0.04)",
            border: "1px solid rgba(249,115,22,0.12)",
            width: "100%",
            maxWidth: 320,
          }}>
            <div style={{ fontFamily: monoFontFamily, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>TOTAL DEPOSITED</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: monoFontFamily, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>$</span>
              <span style={{ fontFamily: monoFontFamily, fontWeight: 500, fontSize: 40, color: "white", letterSpacing: -1 }}>500.00</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <div style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.15)",
              }}>
                <div style={{ fontFamily: monoFontFamily, fontSize: 8, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>EARNED</div>
                <div style={{ fontFamily: monoFontFamily, fontSize: 16, fontWeight: 500, color: "#f97316" }}>+${earnedValue.toFixed(6)}</div>
              </div>
              <div style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.15)",
                textAlign: "center",
                minWidth: 80,
              }}>
                <div style={{ fontFamily: monoFontFamily, fontSize: 8, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>APY</div>
                <div style={{ fontFamily: monoFontFamily, fontSize: 18, fontWeight: 500, color: "#f97316" }}>{apyValue.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div style={{
            marginTop: 16,
            width: "100%",
            maxWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {vitals.map((v, i) => {
              const barWidth = interpolate(frame, [40 + i * 15, 80 + i * 15], [0, v.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontFamily: monoFontFamily, fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.3)", width: 70 }}>{v.label}</div>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ width: `${barWidth}%`, height: "100%", borderRadius: 2, background: v.color }} />
                  </div>
                  <div style={{ fontFamily: monoFontFamily, fontSize: 10, color: "rgba(255,255,255,0.4)", width: 30, textAlign: "right" }}>{Math.round(barWidth)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL — Agent Log + APY Chart */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 40,
        }}>
          {/* Nav bar */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: syneFontFamily, fontWeight: 800, fontSize: 22, color: "white" }}>Molt</span>
              <span style={{ fontFamily: monoFontFamily, fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>YIELDPET</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ fontFamily: syneFontFamily, fontWeight: 700, fontSize: 14, color: "white" }}>The Hunter</span>
              <span style={{ fontFamily: monoFontFamily, fontSize: 10, color: "#f97316", letterSpacing: 1 }}>AGGRESSIVE</span>
            </div>
          </div>

          {/* APY Chart area */}
          <div style={{
            padding: "24px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 24,
            height: 200,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ fontFamily: monoFontFamily, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>APY HISTORY (24H)</div>
            {/* Simplified chart — animated line */}
            <svg width="100%" height="140" viewBox="0 0 800 140" style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#f97316", stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: "#f97316", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path
                d={`M0,100 C100,80 200,${90 - Math.sin(frame * 0.03) * 20} 300,${70 - Math.sin(frame * 0.04) * 15} C400,${60 - Math.sin(frame * 0.05) * 10} 500,${50 + Math.sin(frame * 0.03) * 15} 600,${40 + Math.sin(frame * 0.04) * 10} C700,${35 - Math.sin(frame * 0.02) * 8} 800,30 800,30 L800,140 L0,140 Z`}
                fill="url(#chartGrad)"
              />
              {/* Line */}
              <path
                d={`M0,100 C100,80 200,${90 - Math.sin(frame * 0.03) * 20} 300,${70 - Math.sin(frame * 0.04) * 15} C400,${60 - Math.sin(frame * 0.05) * 10} 500,${50 + Math.sin(frame * 0.03) * 15} 600,${40 + Math.sin(frame * 0.04) * 10} C700,${35 - Math.sin(frame * 0.02) * 8} 800,30 800,30`}
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 1200,
                  strokeDashoffset: interpolate(frame, [20, 120], [1200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              />
            </svg>
          </div>

          {/* Agent Log */}
          <div style={{
            flex: 1,
            padding: "20px 24px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}>
            <div style={{ fontFamily: monoFontFamily, fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>AGENT LOG</div>
            {logs.map((log, i) => {
              const logOpacity = interpolate(frame, [log.delay, log.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const logY = interpolate(frame, [log.delay, log.delay + 15], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              // Typing effect
              const charsVisible = interpolate(frame, [log.delay, log.delay + 40], [0, log.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const displayText = log.text.substring(0, Math.floor(charsVisible));
              const showCursor = frame >= log.delay && frame < log.delay + 45;
              return (
                <div key={i} style={{
                  opacity: logOpacity,
                  transform: `translateY(${logY}px)`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: i < logs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#f97316",
                    boxShadow: "0 0 8px rgba(249,115,22,0.4)",
                    marginTop: 6,
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{
                      fontFamily: monoFontFamily,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.5,
                    }}>
                      {displayText}
                      {showCursor && <span style={{ color: "#f97316" }}>|</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rebalance Alert */}
          {rebalanceShow && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${rebalanceScale})`,
              opacity: rebalanceOpacity,
              padding: "32px 40px",
              borderRadius: 20,
              background: "rgba(10, 12, 18, 0.95)",
              border: "1px solid rgba(249,115,22,0.3)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(249,115,22,0.1)",
              maxWidth: 500,
              textAlign: "center",
              zIndex: 20,
            }}>
              <div style={{
                fontFamily: monoFontFamily,
                fontSize: 10,
                letterSpacing: 3,
                color: "#f97316",
                marginBottom: 12,
              }}>⚡ REBALANCE DETECTED</div>
              <div style={{
                fontFamily: syneFontFamily,
                fontWeight: 800,
                fontSize: 24,
                color: "white",
                marginBottom: 12,
              }}>Better yield found</div>
              <div style={{
                fontFamily: monoFontFamily,
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}>
                USDC on Arbitrum offers 22.1% APY — that&apos;s 1.3× your current rate.
                Bridge fee: $0.42. Break-even: 3 days.
              </div>
              <div style={{
                display: "inline-block",
                padding: "12px 40px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                fontFamily: syneFontFamily,
                fontWeight: 700,
                fontSize: 14,
                color: "white",
                letterSpacing: 0.5,
              }}>
                Accept Rebalance →
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
