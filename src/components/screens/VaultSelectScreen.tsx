import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppStore } from '../../store/appStore';
import { useVaults } from '../../hooks/useVaults';
import { getPersonality } from '../../lib/personalities';
import { SUPPORTED_CHAINS } from '../../constants/chains';
import { CHAIN_ICONS } from '../icons/ChainIcons';
import { ConnectButton, useWalletState } from '../ui/ConnectButton';
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

  // Auto-recommend: select the top-ranked vault when vaults load (only once)
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (rankedVaults.length > 0 && !selectedVault && !hasAutoSelected.current) {
      hasAutoSelected.current = true;
      setSelectedVault(rankedVaults[0]);
      toast.info(`${config?.name} recommends`, {
        description: `${rankedVaults[0].name} — ${rankedVaults[0].apy.toFixed(2)}% APY on ${rankedVaults[0].chainName}`,
      });
    }
  }, [rankedVaults, selectedVault, setSelectedVault, config]);

  const { address, isConnected, chainId: walletChainId } = useWalletState();
  const walletChainName = SUPPORTED_CHAINS.find(c => c.id === walletChainId)?.name ?? (walletChainId ? `Chain ${walletChainId}` : null);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeposit = () => {
    if (!selectedVault || !isConnected || !address) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      toast.error('Enter a valid amount (minimum $1)');
      return;
    }
    setShowConfirm(true);
  };

  const confirmDeposit = () => {
    if (!selectedVault || !address) return;
    const numAmount = parseFloat(amount);
    setWallet(address);
    setDeposit({ amount: numAmount, tokenAddress: selectedVault.asset, timestamp: Date.now(), txHash: '0xpending' });
    setShowConfirm(false);
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
        <div className="flex items-center gap-2.5">
          
           <span className="font-display font-extrabold text-lg sm:text-xl tracking-[-0.03em]">Molt</span>
           <span className="font-data text-[9px] tracking-[0.15em] text-[var(--yp-text-secondary)] opacity-50">YIELDPET</span>
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
        <div className="flex items-center gap-2 sm:gap-3">
          {isConnected && walletChainName && (
            <div className="flex items-center gap-1.5 font-data text-[9px] sm:text-[10px] tracking-[0.08em] text-[var(--yp-text-secondary)] bg-[var(--yp-surface-2)] border border-[var(--yp-border)] rounded-full px-2.5 py-1.5">
              {(() => {
                const ChainIcon = CHAIN_ICONS[walletChainId ?? 0];
                return ChainIcon ? <ChainIcon size={12} /> : null;
              })()}
              <span className="hidden sm:inline">{walletChainName}</span>
              <span
                className="w-[5px] h-[5px] rounded-full shrink-0"
                style={{ background: config.accent, boxShadow: `0 0 6px ${config.accent}` }}
              />
            </div>
          )}
          <motion.button
            onClick={() => setScreen('personality')}
            className="btn-secondary text-[13px] px-3 sm:px-5"
            whileTap={{ scale: 0.95 }}
          >
            <span className="sm:hidden">←</span>
            <span className="hidden sm:inline">← Back</span>
          </motion.button>
        </div>
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
              className={`chip shrink-0 flex items-center gap-1.5 ${selectedChainId === c.id ? 'active' : ''}`}
              whileTap={{ scale: 0.92 }}
              style={selectedChainId === c.id ? { color: config.accent } : {}}
            >
              {(() => {
                const ChainIcon = CHAIN_ICONS[c.id];
                return ChainIcon ? <ChainIcon size={13} /> : null;
              })()}
              {c.name.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Agent top pick banner */}
        {rankedVaults.length > 0 && config && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-3.5 sm:p-4 mb-4 border flex items-center gap-3 cursor-pointer"
            style={{
              borderColor: `rgba(${config.accentRgb}, 0.35)`,
              background: `rgba(${config.accentRgb}, 0.05)`,
            }}
            onClick={() => setSelectedVault(rankedVaults[0])}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `rgba(${config.accentRgb}, 0.15)` }}
            >
              <config.icon size={16} color={config.accent} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-data text-[9px] tracking-[0.12em] mb-0.5" style={{ color: config.accent }}>
                {config.name.toUpperCase()} TOP PICK
              </div>
              <div className="font-display font-bold text-[12px] sm:text-[13px] truncate">
                {rankedVaults[0].name}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-data text-[14px] sm:text-[16px] font-medium" style={{ color: config.accent }}>
                {rankedVaults[0].apy.toFixed(2)}%
              </div>
              <div className="font-data text-[9px] text-[var(--yp-text-muted)]">{rankedVaults[0].chainName}</div>
            </div>
          </motion.div>
        )}

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

              {/* Chain mismatch warning */}
              {isConnected && walletChainId && selectedVault.chainId !== walletChainId && (
                <div className="rounded-xl p-3.5 border border-amber-500/30 bg-amber-500/[0.06] flex items-start gap-2.5">
                  <span className="text-amber-400 mt-0.5 shrink-0 text-[14px]">⚠</span>
                  <p className="font-data text-[10px] sm:text-[11px] text-[var(--yp-text-secondary)] leading-[1.6]">
                    Your wallet is on <strong>{walletChainName}</strong> but this vault is on <strong>{selectedVault.chainName}</strong>. You'll be prompted to switch networks automatically.
                  </p>
                </div>
              )}

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

                {isConnected ? (
                  <motion.button
                    onClick={handleDeposit}
                    className="btn-primary w-full"
                    style={{ background: config.accent, borderRadius: '12px' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Deposit & Hatch →
                  </motion.button>
                ) : (
                  <ConnectButton accent={config.accent} accentRgb={config.accentRgb} fullWidth />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction confirmation modal */}
        <AnimatePresence>
          {showConfirm && selectedVault && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
              onClick={() => setShowConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bento-card p-6 sm:p-8 w-full max-w-[420px]"
              >
                <div className="meta-label mb-5 text-center">CONFIRM TRANSACTION</div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-data text-[12px]">
                    <span className="text-[var(--yp-text-muted)]">Action</span>
                    <span className="text-[var(--yp-text-secondary)]">Deposit into vault</span>
                  </div>
                  <div className="flex justify-between font-data text-[12px]">
                    <span className="text-[var(--yp-text-muted)]">Vault</span>
                    <span className="text-[var(--yp-text)] font-medium truncate ml-4 text-right">{selectedVault.name}</span>
                  </div>
                  <div className="flex justify-between font-data text-[12px]">
                    <span className="text-[var(--yp-text-muted)]">Chain</span>
                    <span className="text-[var(--yp-text-secondary)]">{selectedVault.chainName}</span>
                  </div>
                  <div className="flex justify-between font-data text-[12px]">
                    <span className="text-[var(--yp-text-muted)]">Protocol</span>
                    <span className="text-[var(--yp-text-secondary)] capitalize">{selectedVault.protocol.replace('-', ' ')}</span>
                  </div>
                  <div className="h-px bg-[var(--yp-border)]" />
                  <div className="flex justify-between font-data text-[14px]">
                    <span className="text-[var(--yp-text-muted)]">Amount</span>
                    <span style={{ color: config.accent }} className="font-medium">${parseFloat(amount).toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between font-data text-[12px]">
                    <span className="text-[var(--yp-text-muted)]">Current APY</span>
                    <span style={{ color: config.accent }}>{selectedVault.apy.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between font-data text-[12px]">
                    <span className="text-[var(--yp-text-muted)]">Est. Annual</span>
                    <span className="text-[var(--yp-text-secondary)]">+${annualEarnings}</span>
                  </div>
                </div>

                <div className="font-data text-[10px] text-[var(--yp-text-muted)] bg-[var(--yp-surface-2)] rounded-lg px-3 py-2.5 mb-5 leading-[1.6]">
                  You will be asked to sign a transaction in your wallet. The transaction routes your USDC through LI.FI into the selected vault. No private keys leave your browser.
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowConfirm(false)}
                    className="btn-secondary flex-1 text-[13px]"
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={confirmDeposit}
                    className="btn-primary flex-1 text-[13px]"
                    style={{ background: config.accent, borderRadius: '12px' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Confirm & Sign
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
