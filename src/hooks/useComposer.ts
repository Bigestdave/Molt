import { useState, useCallback } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { getComposerQuote, type ComposerQuote } from '../lib/lifi';
import type { Hex } from 'viem';

export type ComposerStep = 'idle' | 'quoting' | 'signing' | 'submitted' | 'confirmed' | 'failed';

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s. Please try again.`)), ms)
    ),
  ]);
}

export function useComposer() {
  const [step, setStep] = useState<ComposerStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [quote, setQuote] = useState<ComposerQuote | null>(null);

  const { chain } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
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

      // Verify wallet is on the expected source chain
      if (chain?.id !== params.fromChain) {
        throw new Error(
          `Your wallet is on the wrong network. Please switch to the correct chain in your wallet and try again.`
        );
      }

      setStep('quoting');
      const q = await withTimeout(
        getComposerQuote(params),
        30_000,
        'Route quote'
      );
      setQuote(q);

      setStep('signing');
      const hash = await sendTransactionAsync({
        to: q.transactionRequest.to as Hex,
        data: q.transactionRequest.data as Hex,
        value: BigInt(q.transactionRequest.value || '0'),
        chainId: params.fromChain,
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
  }, [sendTransactionAsync, chain?.id]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setTxHash(null);
    setQuote(null);
  }, []);

  return { step, error, txHash, quote, receipt, isWaitingReceipt, execute, reset };
}
