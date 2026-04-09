import { useEffect, useState, useRef } from 'react';
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

    const simulateDeposit = async () => {
      setStepIndex(0);
      setHatchProgress(0.1);
      await new Promise(r => setTimeout(r, 1500));

      setStepIndex(1);
      setHatchProgress(0.3);
      await new Promise(r => setTimeout(r, 2000));

      setStepIndex(2);
      setHatchProgress(0.6);
      await new Promise(r => setTimeout(r, 2000));

      // Confirmed
      setStepIndex(3);
      setHatchProgress(0.8);
      const hash = '0xsimulated_tx_hash_' + Date.now();
      if (depositInfo) {
        setDepositDetail({ ...depositInfo, txHash: hash });
      }

      await new Promise(r => setTimeout(r, 1000));
      setStepIndex(4);
      setHatchProgress(1.0);

      await new Promise(r => setTimeout(r, 1000));
      setHatched(true);
      setStepIndex(5);
      setCreatureName(generateCreatureName());

      await new Promise(r => setTimeout(r, 1500));
      setScreen('dashboard');
    };

    simulateDeposit();
  }, [config, depositInfo, activeVault, setScreen, setCreatureName, setDepositDetail]);

  if (!config) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden screen-enter">
      {/* Background glow */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${config.accentRgb}, ${hatched ? 0.2 : 0.05}) 0%, transparent 70%)`
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        <div className="mb-12 h-[400px] flex items-center justify-center relative">
          <HatchCanvas
            accent={config.accent}
            accentRgb={config.accentRgb}
            progress={hatchProgress}
            hatched={hatched}
          />
          {hatched && (
            <div className="absolute inset-0 flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div
                className="w-[120px] h-[120px] rounded-[40%_60%_70%_30%] blur-[2px]"
                style={{ background: config.accent, boxShadow: `0 0 40px ${config.accent}` }}
              />
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 border border-[var(--yp-border)] flex flex-col items-center">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {HATCH_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < stepIndex ? 'w-6 opacity-100' :
                  i === stepIndex ? 'w-10 opacity-100' : 'w-2 opacity-20'
                }`}
                style={{ background: i <= stepIndex ? config.accent : 'currentColor' }}
              />
            ))}
          </div>

          {/* Status text */}
          <div className="h-8 relative w-full">
            {HATCH_STEPS.map((text, i) => (
              <div
                key={i}
                className={`font-mono text-sm transition-all duration-300 absolute inset-x-0 ${
                  i === stepIndex ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  color: i === 5 ? config.accent : 'var(--yp-text)',
                  transform: i === stepIndex ? 'translateY(0)' : i < stepIndex ? 'translateY(-12px)' : 'translateY(12px)',
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
