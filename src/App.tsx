import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/appStore';
import { personalities } from './lib/personalities';
import PersonalityScreen from './components/screens/PersonalityScreen';
import VaultSelectScreen from './components/screens/VaultSelectScreen';
import HatchScreen from './components/screens/HatchScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import RebalanceScreen from './components/screens/RebalanceScreen';

const screenVariants = {
  initial: { opacity: 0, scale: 0.98, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, scale: 0.98, y: -12, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

function ScreenManager() {
  const screen = useAppStore((s) => s.screen);
  const screens: Record<string, JSX.Element> = {
    personality: <PersonalityScreen />,
    vaultSelect: <VaultSelectScreen />,
    hatch: <HatchScreen />,
    dashboard: <DashboardScreen />,
    rebalance: <RebalanceScreen />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={screen} variants={screenVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
        {screens[screen] || <PersonalityScreen />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const personality = useAppStore((s) => s.personality);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (personality) {
      const config = personalities[personality];
      if (config) {
        document.documentElement.style.setProperty('--yp-accent', config.accent);
        document.documentElement.style.setProperty('--yp-accent-rgb', config.accentRgb);
      }
    }
  }, [personality]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, []);

  const accentRgb = personality ? personalities[personality].accentRgb : '74, 222, 128';

  return (
    <div onMouseMove={handleMouseMove} className="relative min-h-screen overflow-hidden">
      {/* Mouse-follow radial glow */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(${accentRgb}, 0.06) 0%, transparent 60%)`,
        }}
      />
      <div className="noise-overlay" />
      <div className="relative z-10">
        <ScreenManager />
      </div>
    </div>
  );
}
