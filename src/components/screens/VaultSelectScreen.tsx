import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useVaults } from '../../hooks/useVaults';
import { getPersonality } from '../../lib/personalities';
import { SUPPORTED_CHAINS } from '../../constants/chains';
import type { NormalizedVault } from '../../store/appStore';

function ShimmerRow() {
  return <div className="shimmer h-[76px] rounded-[14px]" />;
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
    setWallet('0xDEMO...USER');
    setDeposit({ amount: numAmount, tokenAddress: selectedVault.asset, timestamp: Date.now(), txHash: '0xmockhash' });
    setScreen('hatch');
  };

  if (!config) return null;

  const annualEarnings = selectedVault
    ? (parseFloat(amount || '0') * (selectedVault.apy / 100)).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Top nav — responsive */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-[var(--yp-border)] bg-[var(--yp-glass-strong)] backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-extrabold text-lg sm:text-xl tracking-[-0.03em]">Molt</span>
          <span className="font-data text-[9px] tracking-[0.15em] text-[var(--yp-text-secondary)] opacity-70 hidden sm:inline">YIELDPET</span>
        </div>
        <div className="hidden sm:flex items-center gap-2.5 bg-[var(--yp-surface-2)] border border-[var(--yp-border-hover)] rounded-full px-4 py-2">
          <config.icon size={16} color={config.accent} />
          <span className="font-display font-bold text-[13px]">{config.name}</span>
          <span className="font-data text-[9px] tracking-[0.1em]" style={{ color: config.accent }}>
            {config.riskTag.toUpperCase()}
          </span>
        </div>
        {/* Mobile: show icon only */}
        <div className="flex sm:hidden items-center gap-2 bg-[var(--yp-surface-2)] border border-[var(--yp-border-hover)] rounded-full px-3 py-2">
          <config.icon size={16} color={config.accent} />
          <span className="font-data text-[9px] tracking-[0.1em]" style={{ color: config.accent }}>
            {config.riskTag.toUpperCase()}
          </span>
        </div>
        <motion.button
          onClick={() => setScreen('personality')}
          className="btn-secondary text-[13px] px-3 sm:px-5"
          whileTap={{ scale: 0.95 }}
        >
          <span className="sm:hidden">←</span>
          <span className="hidden sm:inline">← Back</span>
        </motion.button>
      </nav>

      <div className="flex-1 px-4 sm:px-8 py-8 sm:py-12 max-w-[900px] mx-auto w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >
          <h2 className="font-display font-extrabold text-[32px] sm:text-[40px] tracking-[-0.04em] leading-[0.95] mb-2">
            Select a position
          </h2>
          {usingCachedData && (
            <span className="font-data text-[11px] sm:text-[12px] text-[var(--yp-text-muted)]">
              ● DEMO MODE — CACHED VAULT DATA
            </span>
          )}
        </motion.div>

        {/* Chain filters — horizontal scroll on mobile */}
        <div className="flex gap-2 mb-6 sm:mb-7 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {SUPPORTED_CHAINS.map(c => (
            <motion.button
              key={c.id}
              onClick={() => setSelectedChainId(c.id)}
              className={`chip shrink-0 ${selectedChainId === c.id ? 'active' : ''}`}
              whileTap={{ scale: 0.92 }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: selectedChainId === c.id ? config.accent :
                    c.id === 8453 ? '#2563eb' :
                    c.id === 42161 ? '#3b82f6' :
                    c.id === 1 ? '#627eea' :
                    c.id === 10 ? '#ef4444' :
                    c.id === 137 ? '#8b5cf6' : config.accent,
                }}
              />
              {c.name.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Vault list */}
        <div className="flex flex-col gap-1.5 mb-5">
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
            rankedVaults.map((vault, i) => (
              <VaultRowInline
                key={vault.id}
                vault={vault}
                isSelected={selectedVault?.id === vault.id}
                onSelect={setSelectedVault}
                accent={config.accent}
                accentRgb={config.accentRgb}
                delay={i * 0.04}
              />
            ))
          )}
        </div>

        {/* Agent insight + deposit */}
        <AnimatePresence>
          {selectedVault && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 sm:gap-5"
            >
              {/* Agent insight */}
              <div
                className="rounded-2xl p-5 sm:p-6 border"
                style={{
                  borderColor: config.accent,
                  background: `rgba(${config.accentRgb}, 0.04)`,
                  boxShadow: `0 0 30px rgba(${config.accentRgb}, 0.08)`,
                }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <config.icon size={16} color={config.accent} />
                  <span className="font-data text-[10px] tracking-[0.12em]" style={{ color: config.accent }}>
                    {config.name.toUpperCase()} — ANALYSIS
                  </span>
                </div>
                <p className="font-data text-[11px] sm:text-[12px] text-[var(--yp-text-secondary)] leading-[1.8]">
                  {config.getInsight(selectedVault.name, selectedVault.apy, selectedVault.stabilityScore)}
                </p>
              </div>

              {/* Deposit section */}
              <div className="bento-card p-5 sm:p-7">
                <div className="meta-label mb-4">DEPOSIT AMOUNT</div>
                <div className="flex items-center gap-3 bg-[var(--yp-surface-2)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 sm:px-5 py-3 sm:py-4 mb-3 focus-within:border-[var(--yp-accent)] focus-within:shadow-[0_0_0_1px_var(--yp-accent),0_0_12px_rgba(var(--yp-accent-rgb),0.1)] transition-all duration-300">
                  <span className="font-data text-[16px] sm:text-[18px] text-[var(--yp-text-muted)]">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="bg-transparent border-none outline-none font-data text-[24px] sm:text-[28px] font-medium text-[var(--yp-text)] w-full tracking-[-0.02em] [appearance:textfield] placeholder:text-[var(--yp-text-muted)] placeholder:opacity-30"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val);
                    }}
                    placeholder="0"
                  />
                  <span className="font-data text-[11px] sm:text-[12px] text-[var(--yp-text-muted)] tracking-[0.08em] shrink-0">USDC</span>
                </div>

                {/* Preset amounts */}
                <div className="flex gap-2 mb-4 sm:mb-5">
                  {['100', '500', '1000'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className="flex-1 font-data text-[11px] tracking-[0.05em] py-2 rounded-lg border transition-all duration-200 hover:brightness-125"
                      style={{
                        borderColor: amount === preset ? config.accent : 'var(--yp-border)',
                        background: amount === preset ? `rgba(${config.accentRgb}, 0.1)` : 'var(--yp-surface)',
                        color: amount === preset ? config.accent : 'var(--yp-text-secondary)',
                      }}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                <div className="font-data text-[11px] sm:text-[12px] text-[var(--yp-text-secondary)] bg-[var(--yp-surface-3)] rounded-lg px-4 py-3 mb-4 sm:mb-5">
                  Estimated annual earnings:{' '}
                  <span style={{ color: config.accent, fontWeight: 500 }}>+${annualEarnings}</span>{' '}
                  at current APY
                </div>

                <motion.button
                  onClick={handleDeposit}
                  className="btn-primary w-full"
                  style={{ background: config.accent, borderRadius: '12px' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Deposit & Hatch →
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hide scrollbar for chain filters */}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}

/* Inline vault row */
function VaultRowInline({
  vault, isSelected, onSelect, accent, accentRgb, delay,
}: {
  vault: NormalizedVault;
  isSelected: boolean;
  onSelect: (v: NormalizedVault) => void;
  accent: string;
  accentRgb: string;
  delay: number;
}) {
  const stabilityPct = Math.round(vault.stabilityScore * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={() => onSelect(vault)}
      className={`vault-row flex items-center justify-between p-4 sm:p-5 rounded-[14px] border ${
        isSelected ? 'selected' : 'border-[var(--yp-border)]'
      }`}
      style={isSelected ? { borderColor: accent, boxShadow: `0 0 20px rgba(${accentRgb}, 0.08)` } : {}}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 sm:gap-2.5 mb-1">
          <h3 className="font-display font-bold text-[14px] sm:text-[15px] truncate tracking-[-0.02em]">{vault.name}</h3>
          <span className="font-data text-[8px] sm:text-[9px] tracking-[0.1em] px-1.5 sm:px-2 py-0.5 rounded bg-[var(--yp-surface-3)] text-[var(--yp-text-secondary)] border border-[var(--yp-border)] shrink-0">
            {vault.chainName.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 font-data text-[10px] sm:text-[11px] text-[var(--yp-text-muted)]">
          <span className="capitalize truncate">{vault.protocol.replace('-', ' ')}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">${(vault.tvlUsd / 1_000_000).toFixed(0)}M TVL</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-data text-[10px] sm:text-[11px] text-[var(--yp-text-muted)] tracking-[0.06em] hidden sm:inline">STABILITY</span>
          <div className="stability-bar flex-1" style={{ maxWidth: 80 }}>
            <div
              className="stability-bar-fill"
              style={{
                width: `${stabilityPct}%`,
                background: stabilityPct > 70 ? accent : stabilityPct > 40 ? '#fbbf24' : '#ef4444',
              }}
            />
          </div>
          <span className="font-data text-[10px] sm:text-[11px] text-[var(--yp-text-muted)]">{stabilityPct}%</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div
          className="font-data text-[20px] sm:text-[22px] font-medium tracking-[-0.02em] leading-none"
          style={{ color: accent }}
        >
          {vault.apy.toFixed(2)}%
        </div>
        <div className="font-data text-[8px] sm:text-[9px] tracking-[0.1em] text-[var(--yp-text-muted)] mt-1">APY</div>
      </div>
    </motion.div>
  );
}
