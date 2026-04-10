import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { useAppStore } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import { useComposer } from '../../hooks/useComposer';
import { useWalletState } from '../ui/ConnectButton';
import { USDC_ADDRESSES, CHAIN_EXPLORERS } from '../../constants/chains';
import EvolveCanvas from '../creature/EvolveCanvas';

function stepToPhase(step: string): 'spin' | 'burst' | 'emerge' {
  if (step === 'confirmed') return 'emerge';
  if (step === 'submitted') return 'burst';
  return 'spin';
}

const STATUS_MAP: Record<string, string> = {
  idle: 'Preparing rebalance...',
  quoting: 'Finding best route...',
  signing: 'Approve in wallet...',
  submitted: 'Transaction submitted...',
  confirmed: '',
  failed: 'Rebalance failed.',
};

export default function RebalanceScreen() {
  const personality = useAppStore((s) => s.personality);
  const activeVault = useAppStore((s) => s.activeVault);
  const rebalanceTarget = useAppStore((s) => s.rebalanceTarget);
  const depositInfo = useAppStore((s) => s.deposit);
  const setScreen = useAppStore((s) => s.setScreen);
  const setActiveVault = useAppStore((s) => s.setActiveVault);
  const incrementRebalance = useAppStore((s) => s.incrementRebalance);
  const addLogEntry = useAppStore((s) => s.addLogEntry);
  const creatureName = useAppStore((s) => s.creatureName);

  const { address } = useWalletState();
  const { step, error, txHash, execute, reset } = useComposer();
  const hasStartedRef = useRef(false);
  const config = getPersonality(personality);

  // Execute real rebalance
  useEffect(() => {
    if (!config || !activeVault || !rebalanceTarget || !address || !depositInfo || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const fromUsdc = USDC_ADDRESSES[activeVault.chainId];
    const toUsdc = USDC_ADDRESSES[rebalanceTarget.chainId];
    if (!fromUsdc || !toUsdc) {
      addLogEntry({ message: `Chain not supported for rebalance`, type: 'warning' });
      toast.error('Chain not supported for rebalance');
      setScreen('dashboard');
      return;
    }

    const fromAmount = parseUnits(String(depositInfo.amount), 6).toString();

    execute({
      fromChain: activeVault.chainId,
      toChain: rebalanceTarget.chainId,
      fromToken: activeVault.address,
      toToken: rebalanceTarget.address,
      fromAddress: address,
      fromAmount,
    }).catch(() => {});
  }, [config, activeVault, rebalanceTarget, address, depositInfo, execute, addLogEntry, setScreen]);

  // On confirmation
  useEffect(() => {
    if (step !== 'confirmed' || !rebalanceTarget) return;

    setActiveVault(rebalanceTarget);
    incrementRebalance();
    addLogEntry({ message: `Rebalanced to ${rebalanceTarget.name}. Position upgraded.`, type: 'success' });

    if (txHash) {
      const explorer = CHAIN_EXPLORERS[rebalanceTarget.chainId];
      toast.success('Rebalance confirmed!', {
        description: 'Position migrated on-chain.',
        action: explorer ? { label: 'View TX', onClick: () => window.open(`${explorer}${txHash}`, '_blank') } : undefined,
      });
    }

    const timeout = setTimeout(() => setScreen('dashboard'), 3000);
    return () => clearTimeout(timeout);
  }, [step, txHash, rebalanceTarget, setActiveVault, incrementRebalance, addLogEntry, setScreen]);

  // On failure
  useEffect(() => {
    if (step !== 'failed') return;
    addLogEntry({ message: `Rebalance failed: ${error || 'Unknown error'}`, type: 'warning' });
    toast.error('Rebalance failed', { description: error || 'Transaction was rejected or failed.' });
  }, [step, error, addLogEntry]);

  if (!config) return null;

  const phase = stepToPhase(step);
  const statusText = step === 'confirmed'
    ? `${creatureName} evolved.`
    : error ? `Error: ${error.length > 60 ? error.slice(0, 60) + '…' : error}` : STATUS_MAP[step] || 'Processing...';

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 sm:p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{ background: `radial-gradient(circle at 50% 50%, rgba(${config.accentRgb}, ${phase === 'burst' ? 0.3 : 0.1}) 0%, transparent 60%)` }}
      />
      <div className="relative z-10 w-full max-w-lg mx-auto text-center flex flex-col items-center">
        <div className="h-[320px] sm:h-[400px] flex items-center justify-center mb-6 sm:mb-8">
          <EvolveCanvas accent={config.accent} accentRgb={config.accentRgb} phase={phase} size={320} />
        </div>

        <motion.div
          key={statusText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-data text-[14px] sm:text-[18px]"
          style={{ color: phase === 'emerge' ? config.accent : step === 'failed' ? '#ef4444' : 'inherit' }}
        >
          {statusText}
        </motion.div>

        {txHash && (
          <div className="mt-3 font-data text-[10px] text-[var(--yp-text-muted)] truncate max-w-[300px]">
            TX: {txHash}
          </div>
        )}

        {step === 'failed' && (
          <div className="flex gap-3 mt-5">
            <motion.button
              onClick={() => { reset(); hasStartedRef.current = false; }}
              className="btn-secondary text-[12px] px-5 py-2"
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
            <motion.button
              onClick={() => setScreen('dashboard')}
              className="btn-secondary text-[12px] px-5 py-2"
              whileTap={{ scale: 0.95 }}
            >
              Back to Dashboard
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
