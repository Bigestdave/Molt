import { useState, useCallback } from 'react';
import { getComposerQuote } from '../lib/lifi';

export type ComposerStep = 'idle' | 'quoting' | 'signing' | 'submitted' | 'confirmed' | 'failed';

export function useComposer() {
  const [step, setStep] = useState<ComposerStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const execute = useCallback(async (params: {
    fromChain: number;
    toChain: number;
    fromToken: string;
    toToken: string;
    fromAddress: string;
    fromAmount: string;
    sendTransaction: (tx: { to: string; data: string; value: string }) => Promise<string>;
    waitForReceipt: (hash: string) => Promise<void>;
  }) => {
    try {
      setStep('quoting');
      setError(null);
      const quote = await getComposerQuote({
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAddress: params.fromAddress,
        fromAmount: params.fromAmount,
      });
      setStep('signing');
      const hash = await params.sendTransaction({
        to: quote.transactionRequest.to,
        data: quote.transactionRequest.data,
        value: quote.transactionRequest.value,
      });
      setTxHash(hash);
      setStep('submitted');
      await params.waitForReceipt(hash);
      setStep('confirmed');
      return hash;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      setStep('failed');
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setTxHash(null);
  }, []);

  return { step, error, txHash, execute, reset, setStep, setTxHash };
}
