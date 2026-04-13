import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const ProfileBubble = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterScale = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  
  // Gentle breathing / talking pulse
  const pulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.95, 1.05]
  );

  // Sound wave bars animation
  const bars = [0, 1, 2, 3, 4].map((i) => {
    const offset = i * 0.7;
    return interpolate(
      Math.sin((frame * 0.2) + offset),
      [-1, 1],
      [4, 16]
    );
  });

  return (
    <div style={{
      position: "absolute",
      bottom: 40,
      right: 40,
      display: "flex",
      alignItems: "center",
      gap: 12,
      transform: `scale(${enterScale * pulse})`,
      opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
    }}>
      {/* Sound wave indicator */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "8px 14px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: "rgba(249, 115, 22, 0.8)",
            }}
          />
        ))}
      </div>

      {/* Profile circle — placeholder for user's picture */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        border: "3px solid rgba(249, 115, 22, 0.4)",
        boxShadow: "0 0 30px rgba(249, 115, 22, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "sans-serif",
      }}>
        👤
      </div>
    </div>
  );
};
