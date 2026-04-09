import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useVaults } from '../../hooks/useVaults';
import { getPersonality } from '../../lib/personalities';
import AgentBadge from '../ui/AgentBadge';
import VaultRow from '../ui/VaultRow';
import { SUPPORTED_CHAINS } from '../../constants/chains';
import type { NormalizedVault } from '../../store/appStore';

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

    // Simulate wallet connection for demo
    setWallet('0xDemo...User');

    setDeposit({
      amount: numAmount,
      tokenAddress: selectedVault.asset,
      timestamp: Date.now(),
      txHash: '0xmockhash',
    });
    setScreen('hatch');
  };

  if (!config) return null;

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-4xl mx-auto animate-fade-in screen-enter">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 relative z-20">
        <div className="font-display font-bold text-xl tracking-tight">
          Yield<span style={{ color: config.accent }}>Pet</span>
        </div>
        <AgentBadge personality={personality!} />
        <button onClick={() => setScreen('personality')} className="btn-secondary text-xs py-2 px-4">
          ← Back
        </button>
      </header>

      {usingCachedData && (
        <div className="bg-[var(--yp-surface-2)] border border-[var(--yp-border)] rounded-xl p-3 mb-6 text-sm text-[var(--yp-text-muted)] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--yp-warning)] animate-pulse" />
          Demo mode — using cached vault data
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="font-display text-3xl font-bold mb-6">Select a position</h2>

        {/* Chain filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SUPPORTED_CHAINS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedChainId(c.id)}
              className={`chip ${selectedChainId === c.id ? 'active' : ''}`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Vault list */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: config.accent, borderTopColor: 'transparent' }} />
            </div>
          ) : isError ? (
            <div className="text-center text-[var(--yp-text-muted)] py-8 bg-[var(--yp-surface)] rounded-xl border border-[var(--yp-border)]">
              Failed to load vaults. Please try again.
            </div>
          ) : rankedVaults.length === 0 ? (
            <div className="text-center text-[var(--yp-text-muted)] py-8 bg-[var(--yp-surface)] rounded-xl border border-[var(--yp-border)]">
              No USDC vaults available on this chain yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3 stagger-children">
              {rankedVaults.map(vault => (
                <VaultRow
                  key={vault.id}
                  vault={vault}
                  personality={personality!}
                  isSelected={selectedVault?.id === vault.id}
                  onSelect={setSelectedVault}
                />
              ))}
            </div>
          )}
        </div>

        {/* Agent insight & deposit */}
        {selectedVault && (
          <div className="agent-insight mb-6 border bg-[var(--yp-surface)] animate-slide-down">
            <div className="flex gap-4">
              <div className="text-3xl shrink-0">{config.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-[var(--yp-text-secondary)] leading-relaxed mb-4 italic">
                  "{config.getInsight(selectedVault.name, selectedVault.apy, selectedVault.stabilityScore)}"
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-mono text-[var(--yp-text-muted)] mb-2 uppercase tracking-wider">Deposit (USDC)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--yp-text-muted)]">$</span>
                      <input
                        type="number"
                        className="input-field pl-8"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="flex-1 w-full flex items-center justify-between bg-[var(--yp-surface-2)] p-3.5 rounded-xl border border-[var(--yp-border)]">
                    <span className="text-xs font-mono text-[var(--yp-text-muted)]">Est. 1Y</span>
                    <span className="font-mono font-medium text-lg" style={{ color: config.accent }}>
                      +${(parseFloat(amount || '0') * (selectedVault.apy / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex-1 w-full">
                    <button onClick={handleDeposit} className="btn-primary w-full glow-accent-strong" style={{ padding: '14px' }}>
                      Deposit & Hatch →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
