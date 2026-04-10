import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import HatchCanvas from '../creature/HatchCanvas';
import { generateCreatureName } from '../../lib/creatureNames';

const HATCH_STEPS = [
  "Getting best route...",
  "Waiting for signature...",
  "Transaction submitted...",
  "Deposit confirmed.",
  "Your creature is waking up...",
  "Hatched. 🎉"
];

export default function HatchScreen() {
  const personality = useAppStore((s) => s.personality);
  const depositInfo = useAppStore((s) => s.deposit);
  const activeVault = useAppStore((s) => s.activeVault);
  const setScreen = useAppStore((s) => s.setScreen);
  const setCreatureName = useAppStore((s) => s.setCreatureName);
  const setDepositDetail = useAppStore((s) => s.setDeposit);

  const [hatchProgress, setHatchProgress] = useState(0);
  const [hatched, setHatched] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const hasStartedRef = useRef(false);
  const config = getPersonality(personality);

  useEffect(() => {
    if (!config || !depositInfo || !activeVault || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const run = async () => {
      setStepIndex(0); setHatchProgress(0.1);
      await new Promise(r => setTimeout(r, 1500));
      setStepIndex(1); setHatchProgress(0.3);
      await new Promise(r => setTimeout(r, 2000));
      setStepIndex(2); setHatchProgress(0.6);
      await new Promise(r => setTimeout(r, 2000));
      setStepIndex(3); setHatchProgress(0.8);
      if (depositInfo) setDepositDetail({ ...depositInfo, txHash: '0xsim_' + Date.now() });
      await new Promise(r => setTimeout(r, 1000));
      setStepIndex(4); setHatchProgress(1.0);
      await new Promise(r => setTimeout(r, 1000));
      setHatched(true); setStepIndex(5);
      setCreatureName(generateCreatureName());
      await new Promise(r => setTimeout(r, 1500));
      setScreen('dashboard');
    };
    run();
  }, [config, depositInfo, activeVault, setScreen, setCreatureName, setDepositDetail]);

  if (!config) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Radial glow bg */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${config.accentRgb}, ${hatched ? 0.2 : 0.05}) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        {/* Egg / creature */}
        <motion.div
          className="mb-12 h-[320px] flex items-center justify-center relative"
          layoutId="creature-container"
        >
          <HatchCanvas accent={config.accent} accentRgb={config.accentRgb} progress={hatchProgress} hatched={hatched} size={320} />
        </motion.div>

        {/* Progress card */}
        <div className="bento-card p-6" style={{ minWidth: window.innerWidth > 500 ? 380 : 'auto' }}>
          {/* Progress bar */}
          <div className="h-0.5 bg-[var(--yp-surface-3)] rounded-full mb-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: config.accent, boxShadow: `0 0 8px ${config.accent}` }}
              animate={{ width: `${hatchProgress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Status text */}
          <div className="h-6 relative">
            {HATCH_STEPS.map((text, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: i === stepIndex ? 1 : 0,
                  y: i === stepIndex ? 0 : i < stepIndex ? -8 : 8,
                }}
                className="font-data text-[13px] absolute inset-x-0 text-center"
                style={{ color: i === 5 ? config.accent : 'var(--yp-text-secondary)' }}
              >
                {text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
