import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { MacBookFrame } from "../components/MacBookFrame";
import { loadFont } from "@remotion/google-fonts/Syne";

const { fontFamily: syneFontFamily } = loadFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});

export const VaultScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // MacBook slides in from right with slight rotation
  const macEnter = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const macX = interpolate(macEnter, [0, 1], [300, 0]);
  const macRotateY = interpolate(macEnter, [0, 1], [-8, 0]);

  // Simulated scrolling through vaults
  const scrollY = interpolate(frame, [60, 180], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Label
  const labelOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // APY highlight callout
  const apyShow = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const apyScale = spring({ frame: frame - 100, fps, config: { damping: 12, stiffness: 100 } });

  // Stats cards
  const stats = [
    { label: "Top APY", value: "16.64%", color: "#f97316" },
    { label: "Chains", value: "5", color: "#4ade80" },
    { label: "Protocols", value: "12+", color: "#818cf8" },
  ];

  return (
    <AbsoluteFill>
      {/* Section label */}
      <div style={{
        position: "absolute",
        top: 50,
        right: 80,
        opacity: labelOpacity,
        textAlign: "right",
      }}>
        <div style={{
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 4,
          color: "rgba(74,222,128,0.6)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}>
          STEP 02
        </div>
        <div style={{
          fontFamily: syneFontFamily,
          fontWeight: 800,
          fontSize: 36,
          color: "white",
          letterSpacing: -1,
        }}>
          Select a Vault
        </div>
      </div>

      {/* MacBook */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "55%",
        transform: `translate(-50%, -50%) translateX(${macX}px) scale(0.72)`,
      }}>
        <MacBookFrame
          screenshotPath="images/vault-select.png"
          scrollY={scrollY}
          rotateY={macRotateY}
        />
      </div>

      {/* Stats cards on the left */}
      <div style={{
        position: "absolute",
        left: 60,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {stats.map((s, i) => {
          const sOpacity = interpolate(frame, [140 + i * 15, 160 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const sX = interpolate(frame, [140 + i * 15, 160 + i * 15], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              opacity: sOpacity,
              transform: `translateX(${sX}px)`,
              padding: "20px 28px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${s.color}22`,
              minWidth: 160,
            }}>
              <div style={{
                fontFamily: "monospace",
                fontSize: 10,
                letterSpacing: 2,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>{s.label}</div>
              <div style={{
                fontFamily: syneFontFamily,
                fontWeight: 800,
                fontSize: 32,
                color: s.color,
                letterSpacing: -1,
              }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Cross-chain visual */}
      <div style={{
        position: "absolute",
        right: 60,
        bottom: 60,
        opacity: interpolate(frame, [200, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          padding: "12px 20px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "monospace",
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>⛓</span>
          Base • Ethereum • Arbitrum • Optimism • Polygon
        </div>
      </div>
    </AbsoluteFill>
  );
};
