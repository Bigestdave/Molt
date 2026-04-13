import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 30fps, ~60 seconds = 1800 frames
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={1800}
    fps={30}
    width={1920}
    height={1080}
  />
);
