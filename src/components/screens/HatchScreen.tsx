import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { useAppStore } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import { useComposer } from '../../hooks/useComposer';
import { useWalletState } from '../ui/ConnectButton';
import { USDC_ADDRESSES, CHAIN_EXPLORERS } from '../../constants/chains';
import HatchCanvas from '../creature/HatchCanvas';
import { generateCreatureName } from '../../lib/creatureNames';

const STEP_LABELS: Record<string, string> = {
  idle: 'Preparing...',
  quoting: 'Getting best route...',
  signing: 'Approve in wallet...',
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
      toast.error(`USDC not supported on this chain`);
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
    }).catch(() => {});
  }, [config, depositInfo, activeVault, address, execute, addLogEntry]);

  // On confirmation → finalize and go to dashboard
  useEffect(() => {
    if (step !== 'confirmed' || !depositInfo) return;
    if (txHash) {
      setDeposit({ ...depositInfo, txHash });
      const explorer = CHAIN_EXPLORERS[activeVault?.chainId ?? 0];
      toast.success('Deposit confirmed!', {
        description: 'Your creature is hatching...',
        action: explorer ? { label: 'View TX', onClick: () => window.open(`${explorer}${txHash}`, '_blank') } : undefined,
      });
    }
    setCreatureName(generateCreatureName(personality ?? undefined));
    addLogEntry({ message: 'Deposit confirmed on-chain. Creature hatched!', type: 'success' });
    const timeout = setTimeout(() => setScreen('dashboard'), 2000);
    return () => clearTimeout(timeout);
  }, [step, txHash, depositInfo, activeVault, personality, setDeposit, setCreatureName, setScreen, addLogEntry]);

  // On failure
  useEffect(() => {
    if (step !== 'failed') return;
    toast.error('Deposit failed', { description: error || 'Transaction was rejected or failed.' });
  }, [step, error]);

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
            <div className="flex gap-3 mt-4 justify-center">
              <motion.button
                onClick={() => { reset(); hasStartedRef.current = false; }}
                className="btn-secondary text-[12px] px-5 py-2"
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
              <motion.button
                onClick={() => setScreen('vaultSelect')}
                className="btn-secondary text-[12px] px-5 py-2"
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
