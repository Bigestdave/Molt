import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Syne";

const { fontFamily: syneFontFamily } = loadFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});

export const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo enter
  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 100 } });

  // Tagline
  const tagOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [40, 60], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // URL
  const urlOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Orbiting particles
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + frame * 0.01;
    const radius = 250 + Math.sin(frame * 0.02 + i) * 30;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.4,
      size: 4 + Math.sin(frame * 0.05 + i) * 2,
      opacity: 0.3 + Math.sin(frame * 0.03 + i) * 0.2,
    };
  });

  return (
    <AbsoluteFill>
      {/* Center glow */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "45%",
        transform: "translate(-50%, -50%)",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 60%)",
        filter: "blur(60px)",
      }} />

      {/* Orbiting particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `calc(50% + ${p.x}px)`,
          top: `calc(45% + ${p.y}px)`,
          width: p.size,
          height: p.size,
          borderRadius: "50%",
          background: "#f97316",
          opacity: p.opacity,
          boxShadow: `0 0 ${p.size * 3}px rgba(249,115,22,0.4)`,
        }} />
      ))}

      {/* Center content */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Logo */}
        <div style={{
          transform: `scale(${logoScale})`,
          marginBottom: 30,
        }}>
          <span style={{
            fontFamily: syneFontFamily,
            fontWeight: 800,
            fontSize: 80,
            color: "white",
            letterSpacing: -3,
          }}>Molt</span>
          <span style={{
            fontFamily: "monospace",
            fontSize: 14,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.25)",
            marginLeft: 16,
            verticalAlign: "super",
          }}>YIELDPET</span>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: syneFontFamily,
            fontWeight: 700,
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: -0.5,
            margin: 0,
          }}>
            Your yield, <span style={{ color: "#f97316" }}>alive.</span>
          </p>
        </div>

        {/* Accent line */}
        <div style={{
          width: interpolate(frame, [80, 120], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)",
          marginTop: 30,
          marginBottom: 30,
          borderRadius: 1,
        }} />

        {/* URL */}
        <div style={{
          opacity: urlOpacity,
          fontFamily: "monospace",
          fontSize: 16,
          letterSpacing: 2,
          color: "rgba(255,255,255,0.4)",
        }}>
          molt.finance
        </div>
      </div>

      {/* Profile overlay spot — bottom right */}
      <div style={{
        position: "absolute",
        bottom: 40,
        right: 40,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: urlOpacity,
      }}>
        <div style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: 1,
        }}>
          YOUR VOICE HERE →
        </div>
      </div>
    </AbsoluteFill>
  );
};
