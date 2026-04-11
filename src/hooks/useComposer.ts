import { useState, useCallback } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt, useSwitchChain, useAccount } from 'wagmi';
import { getComposerQuote, type ComposerQuote } from '../lib/lifi';
import type { Hex } from 'viem';

export type ComposerStep = 'idle' | 'switching' | 'quoting' | 'signing' | 'submitted' | 'confirmed' | 'failed';

export function useComposer() {
  const [step, setStep] = useState<ComposerStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [quote, setQuote] = useState<ComposerQuote | null>(null);

  const { chain } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const { data: receipt, isLoading: isWaitingReceipt } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  // When receipt arrives and we're in 'submitted' state, move to confirmed
  if (receipt && step === 'submitted') {
    setStep('confirmed');
  }

  const execute = useCallback(async (params: {
    fromChain: number;
    toChain: number;
    fromToken: string;
    toToken: string;
    fromAddress: string;
    fromAmount: string;
  }) => {
    try {
      setError(null);
      setTxHash(null);

      // Auto-switch chain if wallet is on wrong network
      if (chain?.id !== params.fromChain) {
        setStep('switching');
        try {
          await switchChainAsync({ chainId: params.fromChain });
        } catch (switchErr: unknown) {
          const msg = switchErr instanceof Error ? switchErr.message : 'Failed to switch chain';
          if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('user denied')) {
            throw new Error('You rejected the chain switch. Please switch your wallet to the correct network and try again.');
          }
          throw new Error(`Chain switch failed: ${msg}`);
        }
      }

      setStep('quoting');
      const q = await getComposerQuote(params);
      setQuote(q);

      setStep('signing');
      const hash = await sendTransactionAsync({
        to: q.transactionRequest.to as Hex,
        data: q.transactionRequest.data as Hex,
        value: BigInt(q.transactionRequest.value || '0'),
        chainId: q.transactionRequest.chainId,
      });

      setTxHash(hash);
      setStep('submitted');
      return hash;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      setStep('failed');
      throw err;
    }
  }, [sendTransactionAsync, switchChainAsync, chain?.id]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setTxHash(null);
    setQuote(null);
  }, []);

  return { step, error, txHash, quote, receipt, isWaitingReceipt, execute, reset };
}