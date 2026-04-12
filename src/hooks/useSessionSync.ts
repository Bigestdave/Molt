import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/appStore';

/**
 * Syncs wallet session data to the database.
 * - On wallet connect: fetches existing session from DB and restores it
 * - On state changes: debounced upsert to DB
 */
export function useSessionSync(walletAddress: string | null) {
  const personality = useAppStore((s) => s.personality);
  const creatureName = useAppStore((s) => s.creatureName);
  const creatureState = useAppStore((s) => s.creatureState);
  const activeVault = useAppStore((s) => s.activeVault);
  const deposit = useAppStore((s) => s.deposit);
  const earnedUSD = useAppStore((s) => s.earnedUSD);
  const rebalanceCount = useAppStore((s) => s.rebalanceCount);
  const screen = useAppStore((s) => s.screen);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaving = useRef(false);

  // Save session to DB (debounced)
  useEffect(() => {
    if (!walletAddress || !personality || !deposit || !activeVault) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      if (isSaving.current) return;
      isSaving.current = true;

      try {
        await supabase
          .from('wallet_sessions')
          .upsert(
            {
              wallet_address: walletAddress.toLowerCase(),
              personality,
              creature_name: creatureName,
              creature_state: creatureState,
              active_vault: activeVault as any,
              deposit: deposit as any,
              earned_usd: earnedUSD,
              rebalance_count: rebalanceCount,
              screen: screen === 'personality' || screen === 'vaultSelect' || screen === 'hatch' ? 'dashboard' : screen,
            },
            { onConflict: 'wallet_address' }
          );
      } catch (e) {
        console.error('Failed to save session:', e);
      } finally {
        isSaving.current = false;
      }
    }, 2000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [walletAddress, personality, creatureName, creatureState, activeVault, deposit, earnedUSD, rebalanceCount, screen]);
}

/**
 * Fetches a wallet session from the database.
 * Returns null if no session exists.
 */
export async function fetchWalletSession(walletAddress: string) {
  const { data, error } = await supabase
    .from('wallet_sessions')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
