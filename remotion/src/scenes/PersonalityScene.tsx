import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { MacBookFrame } from "../components/MacBookFrame";
import { loadFont } from "@remotion/google-fonts/Syne";

const { fontFamily: syneFontFamily } = loadFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});

export const PersonalityScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // MacBook enters from bottom
  const macEnter = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const macY = interpolate(macEnter, [0, 1], [200, 0]);
  const macScale = interpolate(macEnter, [0, 1], [0.85, 0.72]);

  // Label text enter
  const labelOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelY = interpolate(frame, [30, 50], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Simulated cursor movement toward "The Hunter" card
  const cursorVisible = frame > 90;
  const cursorX = interpolate(frame, [90, 150], [400, 680], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorY = interpolate(frame, [90, 150], [200, 520], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Click pulse
  const clickFrame = 155;
  const clickPulse = frame >= clickFrame && frame < clickFrame + 15
    ? interpolate(frame, [clickFrame, clickFrame + 8, clickFrame + 15], [1, 1.3, 1], { extrapolateRight: "clamp" })
    : 1;

  // Callout cards
  const callouts = [
    { text: "Choose your strategy", sub: "Conservative • Aggressive • Analytical", delay: 60 },
    { text: "AI-powered rebalancing", sub: "Your agent monitors 24/7", delay: 200 },
  ];

  return (
    <AbsoluteFill>
      {/* Section label */}
      <div style={{
        position: "absolute",
        top: 50,
        left: 80,
        opacity: labelOpacity,
        transform: `translateY(${labelY}px)`,
      }}>
        <div style={{
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 4,
          color: "rgba(249,115,22,0.6)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}>
          STEP 01
        </div>
        <div style={{
          fontFamily: syneFontFamily,
          fontWeight: 800,
          fontSize: 36,
          color: "white",
          letterSpacing: -1,
        }}>
          Pick Your Agent
        </div>
      </div>

      {/* MacBook with personality screen */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "55%",
        transform: `translate(-50%, -50%) translateY(${macY}px) scale(${macScale})`,
      }}>
        <MacBookFrame screenshotPath="images/personality-selected.png" />

        {/* Animated cursor */}
        {cursorVisible && (
          <div style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            transform: `scale(${clickPulse})`,
            zIndex: 10,
          }}>
            {/* Cursor arrow */}
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
              <path d="M3 2L21 14L12 16L8 26L3 2Z" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            </svg>
            {/* Click ripple */}
            {frame >= clickFrame && frame < clickFrame + 20 && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "2px solid rgba(249,115,22,0.5)",
                transform: `translate(-50%, -50%) scale(${interpolate(frame, [clickFrame, clickFrame + 20], [0.5, 2], { extrapolateRight: "clamp" })})`,
                opacity: interpolate(frame, [clickFrame, clickFrame + 20], [0.8, 0], { extrapolateRight: "clamp" }),
              }} />
            )}
          </div>
        )}
      </div>

      {/* Callout cards */}
      {callouts.map((c, i) => {
        const cOpacity = interpolate(frame, [c.delay, c.delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const cX = interpolate(frame, [c.delay, c.delay + 20], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const side = i === 0 ? "left" : "right";
        return (
          <div key={i} style={{
            position: "absolute",
            [side]: 60,
            bottom: 80 + i * 100,
            opacity: cOpacity,
            transform: `translateX(${side === "left" ? -cX : cX}px)`,
            padding: "16px 24px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            maxWidth: 280,
          }}>
            <div style={{
              fontFamily: syneFontFamily,
              fontWeight: 700,
              fontSize: 16,
              color: "white",
              marginBottom: 4,
            }}>{c.text}</div>
            <div style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 0.5,
            }}>{c.sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
