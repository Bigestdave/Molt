import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { IntroScene } from "./scenes/IntroScene";
import { PersonalityScene } from "./scenes/PersonalityScene";
import { VaultScene } from "./scenes/VaultScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { OutroScene } from "./scenes/OutroScene";
import { PersistentBackground } from "./components/PersistentBackground";
import { ProfileBubble } from "./components/ProfileBubble";

export const MainVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#06070a" }}>
      <PersistentBackground />

      <TransitionSeries>
        {/* Scene 1: Cinematic Intro — 6s */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 2: Personality Selection — 10s */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <PersonalityScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 3: Vault Selection — 10s */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <VaultScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 4: Dashboard — 20s */}
        <TransitionSeries.Sequence durationInFrames={600}>
          <DashboardScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 30 })}
        />

        {/* Scene 5: Outro — 8s */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Profile bubble — persistent from scene 2 onwards */}
      <Sequence from={200}>
        <ProfileBubble />
      </Sequence>
    </AbsoluteFill>
  );
};
