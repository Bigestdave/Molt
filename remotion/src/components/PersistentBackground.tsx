import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow-drifting organic blobs like the example video
  const blob1X = interpolate(frame, [0, 900, 1800], [20, 60, 30]);
  const blob1Y = interpolate(frame, [0, 900, 1800], [30, 70, 40]);
  const blob2X = interpolate(frame, [0, 900, 1800], [70, 30, 80]);
  const blob2Y = interpolate(frame, [0, 900, 1800], [60, 20, 50]);
  const blob3X = interpolate(frame, [0, 600, 1200, 1800], [50, 20, 80, 50]);
  const blob3Y = interpolate(frame, [0, 600, 1200, 1800], [80, 40, 60, 80]);

  return (
    <AbsoluteFill>
      {/* Deep dark base */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(160deg, #06070a 0%, #0a0d14 50%, #06070a 100%)",
      }} />

      {/* Organic blob 1 — orange accent */}
      <div style={{
        position: "absolute",
        width: 800,
        height: 800,
        borderRadius: "50%",
        left: `${blob1X}%`,
        top: `${blob1Y}%`,
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)",
        filter: "blur(80px)",
      }} />

      {/* Organic blob 2 — green accent */}
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        left: `${blob2X}%`,
        top: `${blob2Y}%`,
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(74, 222, 128, 0.06) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />

      {/* Organic blob 3 — indigo accent */}
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        borderRadius: "50%",
        left: `${blob3X}%`,
        top: `${blob3Y}%`,
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(129, 140, 248, 0.06) 0%, transparent 70%)",
        filter: "blur(70px)",
      }} />

      {/* Subtle noise grain overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
    </AbsoluteFill>
  );
};
