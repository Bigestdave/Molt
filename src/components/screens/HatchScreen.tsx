import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import { useComposer } from '../../hooks/useComposer';
import { useWalletState } from '../ui/ConnectButton';
import HatchCanvas from '../creature/HatchCanvas';
import { generateCreatureName } from '../../lib/creatureNames';
import { parseUnits } from 'viem';

const USDC_ADDRESSES: Record<number, string> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
};

const STEP_LABELS: Record<string, string> = {
  idle: 'Preparing...',
  quoting: 'Getting best route...',
  signing: 'Waiting for signature...',
  submitted: 'Transaction submitted...',
  confirmed: 'Deposit confirmed.',
  failed: 'Transaction failed.',
};

function stepToProgress(step: string): number {
  switch (step) {
    case 'idle': return 0.05;
    case 'quoting': return 0.2;
    case 'signing': return 0.45;
    case 'submitted': return 0.7;
    case 'confirmed': return 1.0;
    case 'failed': return 0;
    default: return 0;
  }
}

export default function HatchScreen() {
  const personality = useAppStore((s) => s.personality);
  const depositInfo = useAppStore((s) => s.deposit);
  const activeVault = useAppStore((s) => s.activeVault);
  const setScreen = useAppStore((s) => s.setScreen);
  const setCreatureName = useAppStore((s) => s.setCreatureName);
  const setDeposit = useAppStore((s) => s.setDeposit);
  const addLogEntry = useAppStore((s) => s.addLogEntry);

  const { address } = useWalletState();
  const { step, error, txHash, execute, reset } = useComposer();
  const hasStartedRef = useRef(false);
  const config = getPersonality(personality);

  // Execute the real deposit
  useEffect(() => {
    if (!config || !depositInfo || !activeVault || !address || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const chainId = activeVault.chainId;
    const usdcAddress = USDC_ADDRESSES[chainId];
    if (!usdcAddress) {
      addLogEntry({ message: `USDC not supported on chain ${chainId}`, type: 'warning' });
      return;
    }

    const fromAmount = parseUnits(String(depositInfo.amount), 6).toString();

    execute({
      fromChain: chainId,
      toChain: chainId,
      fromToken: usdcAddress,
      toToken: activeVault.address,
      fromAddress: address,
      fromAmount,
    }).catch(() => {
      // error state handled by useComposer
    });
  }, [config, depositInfo, activeVault, address, execute, addLogEntry]);

  // On confirmation, finalize and go to dashboard
  useEffect(() => {
    if (step !== 'confirmed' || !depositInfo) return;
    if (txHash) {
      setDeposit({ ...depositInfo, txHash });
    }
    setCreatureName(generateCreatureName(personality ?? undefined));
    addLogEntry({ message: 'Deposit confirmed on-chain. Creature hatched!', type: 'success' });
    const timeout = setTimeout(() => setScreen('dashboard'), 2000);
    return () => clearTimeout(timeout);
  }, [step, txHash, depositInfo, personality, setDeposit, setCreatureName, setScreen, addLogEntry]);

  if (!config) return null;

  const progress = stepToProgress(step);
  const hatched = step === 'confirmed';
  const currentLabel = error
    ? `Error: ${error.length > 80 ? error.slice(0, 80) + '…' : error}`
    : STEP_LABELS[step] || 'Processing...';

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 sm:p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${config.accentRgb}, ${hatched ? 0.2 : 0.05}) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        <motion.div
          className="mb-8 sm:mb-12 flex items-center justify-center relative"
          style={{ height: 'min(320px, 50vw)', minHeight: 200 }}
          layoutId="creature-container"
        >
          <HatchCanvas accent={config.accent} accentRgb={config.accentRgb} progress={progress} hatched={hatched} size={280} />
        </motion.div>

        <div className="bento-card p-5 sm:p-6 w-full sm:min-w-[380px]">
          <div className="h-0.5 bg-[var(--yp-surface-3)] rounded-full mb-5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: step === 'failed' ? '#ef4444' : config.accent, boxShadow: `0 0 8px ${config.accent}` }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="font-data text-[12px] sm:text-[13px] text-center" style={{ color: step === 'failed' ? '#ef4444' : 'var(--yp-text-secondary)' }}>
            {currentLabel}
          </div>

          {txHash && (
            <div className="mt-3 font-data text-[10px] text-[var(--yp-text-muted)] truncate">
              TX: {txHash}
            </div>
          )}

          {step === 'failed' && (
            <motion.button
              onClick={() => { reset(); hasStartedRef.current = false; }}
              className="btn-secondary mt-4 text-[12px] px-5 py-2"
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
