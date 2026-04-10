import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { getPersonality } from '../lib/personalities';
import type { NormalizedVault } from '../store/appStore';

export function useAgentLogic() {
  const personality = useAppStore((s) => s.personality);
  const activeVault = useAppStore((s) => s.activeVault);
  const allVaults = useAppStore((s) => s.allVaults);
  const addLogEntry = useAppStore((s) => s.addLogEntry);
  const setRebalanceTarget = useAppStore((s) => s.setRebalanceTarget);
  const setShowRebalanceAlert = useAppStore((s) => s.setShowRebalanceAlert);
  const deposit = useAppStore((s) => s.deposit);
  const addApyDatapoint = useAppStore((s) => s.addApyDatapoint);
  const screen = useAppStore((s) => s.screen);

  const config = getPersonality(personality);
  const lastIdleRef = useRef(0);
  const lastCheckRef = useRef(0);

  // APY polling is now handled in DashboardScreen via fetchVaultDetail

  const checkRebalance = useCallback(() => {
    if (!config || !activeVault || !deposit || allVaults.length === 0) return;
    const maxApy = Math.max(...allVaults.map(v => v.apy), 1);
    const ranked = allVaults
      .filter(v => v.id !== activeVault.id)
      .map(v => ({ vault: v, score: config.rankVault(v, maxApy) }))
      .sort((a, b) => b.score - a.score);
    if (ranked.length === 0) return;
    const best = ranked[0];
    if (config.shouldRebalance(activeVault, best.vault)) {
      setRebalanceTarget(best.vault);
      setShowRebalanceAlert(true);
      addLogEntry({
        message: config.getRebalanceMessage(activeVault.apy, best.vault.apy, best.vault.name),
        type: 'action',
      });
    }
  }, [config, activeVault, allVaults, deposit, setRebalanceTarget, setShowRebalanceAlert, addLogEntry]);

  useEffect(() => {
    if (screen !== 'dashboard' || !activeVault || !deposit) return;
    const now = Date.now();
    if (now - lastCheckRef.current < 60_000) return;
    lastCheckRef.current = now;
    const timeout = setTimeout(checkRebalance, 5000);
    const interval = setInterval(checkRebalance, 60_000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [screen, activeVault, deposit, checkRebalance]);

  useEffect(() => {
    if (!config || screen !== 'dashboard') return;
    const sendIdleMessage = () => {
      const msgs = config.getIdleMessages();
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      addLogEntry({ message: msg, type: 'info' });
    };
    const now = Date.now();
    if (now - lastIdleRef.current > 30_000) {
      lastIdleRef.current = now;
      setTimeout(sendIdleMessage, 2000);
    }
    const interval = setInterval(() => {
      lastIdleRef.current = Date.now();
      sendIdleMessage();
    }, 45_000);
    return () => clearInterval(interval);
  }, [config, screen, addLogEntry]);

  const getRankedVaults = useCallback((): (NormalizedVault & { personalityScore: number })[] => {
    if (!config || allVaults.length === 0) return [];
    const maxApy = Math.max(...allVaults.map(v => v.apy), 1);
    return allVaults
      .map(v => ({ ...v, personalityScore: parseFloat(config.rankVault(v, maxApy).toFixed(3)) }))
      .sort((a, b) => b.personalityScore - a.personalityScore);
  }, [config, allVaults]);

  return { checkRebalance, getRankedVaults, config };
}
