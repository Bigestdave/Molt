import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useVaults } from '../../hooks/useVaults';
import { getPersonality } from '../../lib/personalities';
import AgentBadge from '../ui/AgentBadge';
import VaultRow from '../ui/VaultRow';
import { SUPPORTED_CHAINS } from '../../constants/chains';
import type { NormalizedVault } from '../../store/appStore';

function ShimmerRow() {
  return (
    <div className="shimmer h-[72px] rounded-2xl" />
  );
}

export default function VaultSelectScreen() {
  const personality = useAppStore((s) => s.personality);
  const setScreen = useAppStore((s) => s.setScreen);
  const setDeposit = useAppStore((s) => s.setDeposit);
  const selectedVault = useAppStore((s) => s.activeVault);
  const setSelectedVault = useAppStore((s) => s.setActiveVault);
  const usingCachedData = useAppStore((s) => s.usingCachedData);
  const setWallet = useAppStore((s) => s.setWallet);

  const [selectedChainId, setSelectedChainId] = useState<number>(0);
  const [amount, setAmount] = useState<string>('100');

  const { data: vaults, isLoading, isError } = useVaults(selectedChainId === 0 ? undefined : selectedChainId);
  const config = getPersonality(personality);

  const rankedVaults = useMemo(() => {
    if (!vaults || !config) return [];
    const maxApy = Math.max(...vaults.map((v) => v.apy), 1);
    return [...vaults]
      .filter((v) => v.asset === 'USDC')
      .sort((a, b) => config.rankVault(b, maxApy) - config.rankVault(a, maxApy));
  }, [vaults, config]);

  const handleDeposit = () => {
    if (!selectedVault) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) return;
    setWallet('0xDemo...User');
    setDeposit({ amount: numAmount, tokenAddress: selectedVault.asset, timestamp: Date.now(), txHash: '0xmockhash' });
    setScreen('hatch');
  };

  if (!config) return null;

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-10"
      >
        <div className="font-display font-extrabold text-xl tracking-tighter">
          Yield<span style={{ color: config.accent }}>Pet</span>
        </div>
        <AgentBadge personality={personality!} />
        <motion.button
          onClick={() => setScreen('personality')}
          className="btn-secondary text-xs py-2 px-4"
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>
      </motion.header>

      {usingCachedData && (
        <div className="bento-card p-3 mb-6 text-center">
          <span className="meta-label" style={{ opacity: 1 }}>
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--yp-warning)] animate-pulse mr-2" />
            Demo mode — cached vault data
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display font-extrabold text-4xl tracking-tighter mb-8"
        >
          Select a position
        </motion.h2>

        {/* Chain filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SUPPORTED_CHAINS.map(c => (
            <motion.button
              key={c.id}
              onClick={() => setSelectedChainId(c.id)}
              className={`chip ${selectedChainId === c.id ? 'active' : ''}`}
              whileTap={{ scale: 0.92 }}
            >
              {c.icon} {c.name}
            </motion.button>
          ))}
        </div>

        {/* Vault list */}
        <div className="flex-1 overflow-y-auto mb-8 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => <ShimmerRow key={i} />)}
            </div>
          ) : isError ? (
            <div className="text-center text-[var(--yp-text-muted)] py-10 bento-card">
              Failed to load vaults.
            </div>
          ) : rankedVaults.length === 0 ? (
            <div className="text-center text-[var(--yp-text-muted)] py-10 bento-card">
              No USDC vaults available.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rankedVaults.map((vault, i) => (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <VaultRow vault={vault} personality={personality!} isSelected={selectedVault?.id === vault.id} onSelect={setSelectedVault} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Deposit panel */}
        {selectedVault && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card p-6"
          >
            <div className="flex gap-5">
              <div className="text-3xl shrink-0">{config.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-[var(--yp-text-secondary)] leading-relaxed mb-5 italic">
                  "{config.getInsight(selectedVault.name, selectedVault.apy, selectedVault.stabilityScore)}"
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="meta-label block mb-2">Deposit (USDC)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--yp-text-muted)]">$</span>
                      <input type="number" className="input-field pl-8" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" />
                    </div>
                  </div>
                  <div className="flex-1 w-full flex items-center justify-between bg-[var(--yp-surface)] p-4 rounded-2xl border border-[var(--yp-border)]">
                    <span className="meta-label">Est. 1Y</span>
                    <span className="font-data font-medium text-lg" style={{ color: config.accent }}>
                      +${(parseFloat(amount || '0') * (selectedVault.apy / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex-1 w-full">
                    <motion.button
                      onClick={handleDeposit}
                      className="btn-primary w-full glow-accent-strong"
                      style={{ padding: '14px' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Deposit & Hatch →
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
