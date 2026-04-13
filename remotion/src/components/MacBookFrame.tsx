import { Img, staticFile, useCurrentFrame, interpolate } from "remotion";

interface MacBookFrameProps {
  screenshotPath: string;
  scrollY?: number;
  scale?: number;
  rotateY?: number;
}

export const MacBookFrame = ({ screenshotPath, scrollY = 0, scale = 1, rotateY = 0 }: MacBookFrameProps) => {
  const frame = useCurrentFrame();

  return (
    <div style={{
      width: 1200,
      height: 780,
      position: "relative",
      transform: `scale(${scale}) perspective(2000px) rotateY(${rotateY}deg)`,
      transformOrigin: "center center",
    }}>
      {/* MacBook body / bezel */}
      <div style={{
        width: "100%",
        height: "100%",
        borderRadius: 16,
        background: "linear-gradient(180deg, #1a1a1f 0%, #111115 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Title bar */}
        <div style={{
          height: 36,
          background: "linear-gradient(180deg, #2a2a30 0%, #1e1e24 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          gap: 8,
          flexShrink: 0,
        }}>
          {/* Traffic lights */}
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          <div style={{
            marginLeft: "auto",
            marginRight: "auto",
            fontSize: 12,
            fontFamily: "sans-serif",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 0.5,
          }}>
            molt.finance
          </div>
        </div>

        {/* Screen content */}
        <div style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}>
          <Img
            src={staticFile(screenshotPath)}
            style={{
              width: "100%",
              position: "absolute",
              top: -scrollY,
              left: 0,
            }}
          />
        </div>
      </div>

      {/* MacBook base/hinge */}
      <div style={{
        width: "110%",
        height: 14,
        background: "linear-gradient(180deg, #2a2a30 0%, #1a1a1f 100%)",
        borderRadius: "0 0 8px 8px",
        margin: "0 auto",
        position: "relative",
        left: "-5%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}>
        {/* Notch */}
        <div style={{
          width: 80,
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          position: "absolute",
          top: 5,
          left: "50%",
          transform: "translateX(-50%)",
        }} />
      </div>
    </div>
  );
};
