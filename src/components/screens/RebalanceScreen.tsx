import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import EvolveCanvas from '../creature/EvolveCanvas';

export default function RebalanceScreen() {
  const personality = useAppStore((s) => s.personality);
  const activeVault = useAppStore((s) => s.activeVault);
  const rebalanceTarget = useAppStore((s) => s.rebalanceTarget);
  const setScreen = useAppStore((s) => s.setScreen);
  const setActiveVault = useAppStore((s) => s.setActiveVault);
  const incrementRebalance = useAppStore((s) => s.incrementRebalance);
  const addLogEntry = useAppStore((s) => s.addLogEntry);
  const creatureName = useAppStore((s) => s.creatureName);

  const [phase, setPhase] = useState<'spin' | 'burst' | 'emerge'>('spin');
  const [statusText, setStatusText] = useState('Executing swap...');
  const hasStartedRef = useRef(false);
  const config = getPersonality(personality);

  useEffect(() => {
    if (!config || !activeVault || !rebalanceTarget || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const executeRebalance = async () => {
      try {
        setPhase('spin');
        setStatusText('Executing swap...');
        await new Promise(r => setTimeout(r, 2000));

        if (activeVault.chainId !== rebalanceTarget.chainId) {
          setStatusText(`Bridging to ${rebalanceTarget.chainName}...`);
          await new Promise(r => setTimeout(r, 1500));
        }

        setStatusText('Depositing to new vault...');
        await new Promise(r => setTimeout(r, 1000));

        setPhase('burst');
        await new Promise(r => setTimeout(r, 1000));

        setActiveVault(rebalanceTarget);
        incrementRebalance();
        addLogEntry({
          message: `Successfully rebalanced to ${rebalanceTarget.name}. Position upgraded.`,
          type: 'success'
        });

        setPhase('emerge');
        setStatusText(`${creatureName} evolved! ✨`);
        await new Promise(r => setTimeout(r, 3000));
        setScreen('dashboard');
      } catch (err) {
        console.error('Rebalance failed:', err);
        addLogEntry({ message: 'Rebalance transaction failed.', type: 'warning' });
        setScreen('dashboard');
      }
    };

    executeRebalance();
  }, [config, activeVault, rebalanceTarget, setActiveVault, incrementRebalance, addLogEntry, setScreen, creatureName]);

  if (!config) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden screen-enter">
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${config.accentRgb}, ${phase === 'burst' ? 0.3 : 0.1}) 0%, transparent 60%)`
        }}
      />
      <div className="relative z-10 w-full max-w-lg mx-auto text-center flex flex-col items-center">
        <div className="h-[400px] flex items-center justify-center mb-8">
          <EvolveCanvas accent={config.accent} accentRgb={config.accentRgb} phase={phase} size={360} />
        </div>
        <div className="font-mono text-xl animate-fade-in-up" style={{ color: phase === 'emerge' ? config.accent : 'inherit' }}>
          {statusText}
        </div>
      </div>
    </div>
  );
}
