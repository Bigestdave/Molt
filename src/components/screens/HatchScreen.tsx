import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { RotateCcw, ArrowLeft, XCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import { useComposer } from '../../hooks/useComposer';
import { useWalletState } from '../ui/ConnectButton';
import { USDC_ADDRESSES, CHAIN_EXPLORERS } from '../../constants/chains';
import HatchCanvas from '../creature/HatchCanvas';
import { generateCreatureName } from '../../lib/creatureNames';

const STEP_LABELS: Record<string, string> = {
  idle: 'Preparing...',
  switching: 'Switching network...',
  quoting: 'Getting best route...',
  signing: 'Approve in wallet...',
  submitted: 'Transaction submitted...',
  confirmed: 'Deposit confirmed.',
  failed: '',
};

function stepToProgress(step: string): number {
  switch (step) {
    case 'idle': return 0.05;
    case 'switching': return 0.1;
    case 'quoting': return 0.2;
    case 'signing': return 0.45;
    case 'submitted': return 0.7;
    case 'confirmed': return 1.0;
    case 'failed': return 0;
    default: return 0;
  }
}

function categorizeError(error: string | null): { title: string; message: string; recoverable: boolean } {
  if (!error) return { title: 'Unknown Error', message: 'Something went wrong. Please try again.', recoverable: true };
  const lower = error.toLowerCase();
  if (lower.includes('user rejected') || lower.includes('user denied') || lower.includes('rejected the request') || lower.includes('rejected the chain switch')) {
    return { title: 'Transaction Rejected', message: 'You cancelled the transaction in your wallet. No funds were moved.', recoverable: true };
  }
  if (lower.includes('chain switch') || lower.includes('does not match the target chain')) {
    return { title: 'Wrong Network', message: 'Your wallet is on a different chain than the vault. Please allow the network switch when prompted, or manually switch in your wallet.', recoverable: true };
  }
  if (lower.includes('insufficient') || lower.includes('exceeds balance') || lower.includes('not enough')) {
    return { title: 'Insufficient Balance', message: 'You don\'t have enough USDC in your wallet for this deposit. Check your balance and try a smaller amount.', recoverable: false };
  }
  if (lower.includes('network') || lower.includes('timeout') || lower.includes('fetch')) {
    return { title: 'Network Error', message: 'Could not reach the network. Check your connection and try again.', recoverable: true };
  }
  if (lower.includes('gas') || lower.includes('underpriced')) {
    return { title: 'Gas Estimation Failed', message: 'The network may be congested — try again shortly.', recoverable: true };
  }
  if (lower.includes('quote') || lower.includes('route')) {
    return { title: 'Route Not Found', message: 'Could not find a route for this transaction. Try a different vault or amount.', recoverable: false };
  }
  return { title: 'Transaction Failed', message: error.length > 120 ? error.slice(0, 120) + '…' : error, recoverable: true };
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

  useEffect(() => {
    if (step !== 'failed') return;
    const { title } = categorizeError(error);
    toast.error(title, { description: error || 'Transaction was rejected or failed.' });
  }, [step, error]);

  if (!config) return null;

  const progress = stepToProgress(step);
  const hatched = step === 'confirmed';
  const isFailed = step === 'failed';
  const errorInfo = categorizeError(error);
  const currentLabel = isFailed ? '' : STEP_LABELS[step] || 'Processing...';

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-5 sm:p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: isFailed
            ? `radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 70%)`
            : `radial-gradient(circle at 50% 50%, rgba(${config.accentRgb}, ${hatched ? 0.2 : 0.05}) 0%, transparent 70%)`,
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

        {isFailed ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full sm:min-w-[380px]"
          >
            <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-5 sm:p-6 mb-4">
              <div className="flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                  <XCircle size={22} className="text-red-400" />
                </div>
              </div>
              <h3 className="font-display font-bold text-[16px] sm:text-[18px] text-red-400 mb-2">{errorInfo.title}</h3>
              <p className="font-data text-[11px] sm:text-[12px] text-[var(--yp-text-secondary)] leading-[1.7]">
                {errorInfo.message}
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setScreen('vaultSelect')}
                className="flex-1 flex items-center justify-center gap-2 font-data text-[12px] sm:text-[13px] px-4 py-3 rounded-xl border border-[var(--yp-border-hover)] bg-[var(--yp-surface)] text-[var(--yp-text-secondary)] hover:bg-[var(--yp-surface-2)] transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={14} />
                Change Vault
              </motion.button>
              {errorInfo.recoverable && (
                <motion.button
                  onClick={() => { reset(); hasStartedRef.current = false; }}
                  className="flex-1 flex items-center justify-center gap-2 font-data text-[12px] sm:text-[13px] px-4 py-3 rounded-xl font-medium"
                  style={{ background: config.accent, color: '#000', borderRadius: '12px' }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <RotateCcw size={14} />
                  Try Again
                </motion.button>
              )}
            </div>

            <div className="flex items-start gap-2 mt-4 px-1">
              <AlertTriangle size={12} className="text-[var(--yp-text-muted)] mt-0.5 shrink-0" />
              <p className="font-data text-[9px] sm:text-[10px] text-[var(--yp-text-muted)] leading-[1.6] text-left">
                No funds were deducted. You can safely retry or choose a different vault.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="bento-card p-5 sm:p-6 w-full sm:min-w-[380px]">
            <div className="h-0.5 bg-[var(--yp-surface-3)] rounded-full mb-5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: config.accent, boxShadow: `0 0 8px ${config.accent}` }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <div className="font-data text-[12px] sm:text-[13px] text-center text-[var(--yp-text-secondary)]">
              {currentLabel}
            </div>

            {txHash && (
              <div className="mt-3 font-data text-[10px] text-[var(--yp-text-muted)] truncate">
                TX: {txHash}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}