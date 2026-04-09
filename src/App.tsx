import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { personalities } from './lib/personalities';
import PersonalityScreen from './components/screens/PersonalityScreen';
import VaultSelectScreen from './components/screens/VaultSelectScreen';
import HatchScreen from './components/screens/HatchScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import RebalanceScreen from './components/screens/RebalanceScreen';

function ScreenManager() {
  const screen = useAppStore((s) => s.screen);
  switch (screen) {
    case 'personality': return <PersonalityScreen />;
    case 'vaultSelect': return <VaultSelectScreen />;
    case 'hatch': return <HatchScreen />;
    case 'dashboard': return <DashboardScreen />;
    case 'rebalance': return <RebalanceScreen />;
    default: return <PersonalityScreen />;
  }
}

export default function App() {
  const personality = useAppStore((s) => s.personality);

  useEffect(() => {
    if (personality) {
      const config = personalities[personality];
      if (config) {
        document.documentElement.style.setProperty('--yp-accent', config.accent);
        document.documentElement.style.setProperty('--yp-accent-rgb', config.accentRgb);
      }
    }
  }, [personality]);

  return (
    <>
      <div className="noise-overlay" />
      <ScreenManager />
    </>
  );
}
