import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Syne";

const { fontFamily: syneFontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

export const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Floating dark blobs — inspired by the example video's organic shapes
  const blobs = [
    { x: 25, y: 35, size: 400, delay: 0, color: "rgba(249,115,22,0.12)" },
    { x: 70, y: 55, size: 350, delay: 5, color: "rgba(74,222,128,0.08)" },
    { x: 45, y: 75, size: 300, delay: 10, color: "rgba(129,140,248,0.08)" },
    { x: 80, y: 20, size: 250, delay: 8, color: "rgba(249,115,22,0.06)" },
  ];

  // Title reveal
  const titleScale = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 100 } });
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Tagline
  const taglineOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [50, 70], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pill badge
  const pillScale = spring({ frame: frame - 10, fps, config: { damping: 25, stiffness: 150 } });

  // Accent line sweep
  const lineWidth = interpolate(frame, [70, 110], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Feature pills
  const features = ["AI Agent", "Cross-Chain", "Auto-Rebalance", "Yield Pet"];
  
  // Exit fade
  const exitOpacity = interpolate(frame, [150, 175], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Animated organic blobs */}
      {blobs.map((blob, i) => {
        const f = Math.max(0, frame - blob.delay);
        const blobScale = spring({ frame: f, fps, config: { damping: 30, stiffness: 40 } });
        const drift = Math.sin(frame * 0.02 + i) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${blob.x}%`,
              top: `${blob.y}%`,
              width: blob.size,
              height: blob.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              transform: `translate(-50%, -50%) scale(${blobScale}) translateY(${drift}px)`,
              filter: "blur(40px)",
            }}
          />
        );
      })}

      {/* Center content */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Status pill */}
        <div style={{
          transform: `scale(${pillScale})`,
          marginBottom: 40,
          padding: "10px 24px",
          borderRadius: 30,
          border: "1px solid rgba(249,115,22,0.3)",
          background: "rgba(249,115,22,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#f97316",
            boxShadow: "0 0 12px rgba(249,115,22,0.6)",
          }} />
          <span style={{
            fontFamily: "monospace",
            fontSize: 14,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.6)",
            textTransform: "uppercase",
          }}>
            Agent Molt — Autonomous DeFi
          </span>
        </div>

        {/* Main title */}
        <div style={{
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          textAlign: "center",
        }}>
          <h1 style={{
            fontFamily: syneFontFamily,
            fontWeight: 800,
            fontSize: 120,
            lineHeight: 0.95,
            letterSpacing: -4,
            color: "white",
            margin: 0,
          }}>
            Your yield,
          </h1>
          <h1 style={{
            fontFamily: syneFontFamily,
            fontWeight: 800,
            fontSize: 130,
            lineHeight: 0.95,
            letterSpacing: -4,
            margin: 0,
            fontStyle: "italic",
            background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            alive.
          </h1>
        </div>

        {/* Accent line */}
        <div style={{
          width: lineWidth,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)",
          marginTop: 40,
          marginBottom: 40,
          borderRadius: 1,
        }} />

        {/* Tagline */}
        <p style={{
          fontFamily: "monospace",
          fontSize: 18,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: 1,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          textAlign: "center",
          maxWidth: 600,
          lineHeight: 1.6,
        }}>
          Select an AI agent. Deposit stablecoins. Watch your creature thrive.
        </p>

        {/* Feature pills */}
        <div style={{
          display: "flex",
          gap: 16,
          marginTop: 50,
        }}>
          {features.map((feat, i) => {
            const fOpacity = interpolate(frame, [80 + i * 10, 95 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const fY = interpolate(frame, [80 + i * 10, 95 + i * 10], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                opacity: fOpacity,
                transform: `translateY(${fY}px)`,
                padding: "8px 20px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "monospace",
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: 1,
              }}>
                {feat}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
