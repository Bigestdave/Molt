import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import { useAgentLogic } from '../../hooks/useAgentLogic';
import { useCreatureState } from '../../hooks/useCreatureState';

import AgentBadge from '../ui/AgentBadge';
import CreatureCanvas from '../creature/CreatureCanvas';
import ApyChart from '../ui/ApyChart';
import AgentLog from '../ui/AgentLog';
import OpportunityCard from '../ui/OpportunityCard';
import RebalanceAlert from '../ui/RebalanceAlert';

export default function DashboardScreen() {
  const { config, getRankedVaults } = useAgentLogic();
  const { energyLevel, yieldHealth, stability, activity, creatureState } = useCreatureState();

  const personality = useAppStore((s) => s.personality);
  const wallet = useAppStore((s) => s.wallet);
  const activeVault = useAppStore((s) => s.activeVault);
  const depositInfo = useAppStore((s) => s.deposit);
  const creatureName = useAppStore((s) => s.creatureName);
  const agentLog = useAppStore((s) => s.agentLog);
  const apyHistory = useAppStore((s) => s.apyHistory);
  const earnedUSD = useAppStore((s) => s.earnedUSD);
  const setEarnedUSD = useAppStore((s) => s.setEarnedUSD);
  const showRebalanceAlert = useAppStore((s) => s.showRebalanceAlert);
  const rebalanceTarget = useAppStore((s) => s.rebalanceTarget);
  const setShowRebalanceAlert = useAppStore((s) => s.setShowRebalanceAlert);
  const setScreen = useAppStore((s) => s.setScreen);

  // Earnings simulation
  useEffect(() => {
    if (!depositInfo || !activeVault) return;
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - depositInfo.timestamp;
      const yearsElapsed = elapsedMs / (1000 * 60 * 60 * 24 * 365);
      const earned = depositInfo.amount * (activeVault.apy / 100) * yearsElapsed;
      const tick = earned + (Math.random() * 0.000001);
      setEarnedUSD(tick);
    }, 1000);
    return () => clearInterval(interval);
  }, [depositInfo, activeVault, setEarnedUSD]);

  const handleExecuteRebalance = () => {
    setShowRebalanceAlert(false);
    setScreen('rebalance');
  };

  const handleDismissRebalance = () => {
    setShowRebalanceAlert(false);
    useAppStore.getState().addLogEntry({
      message: 'Rebalance recommendation dismissed by user.',
      type: 'warning'
    });
  };

  if (!config || !activeVault || !depositInfo) return null;

  const rankedVaults = getRankedVaults().slice(0, 5);
  const timeElapsed = Date.now() - depositInfo.timestamp;
  const daysActive = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
  const hoursActive = Math.floor(timeElapsed / (1000 * 60 * 60));

  return (
    <div className="min-h-screen flex flex-col screen-enter" style={{ background: 'var(--yp-bg)' }}>
      {/* Nav */}
      <nav className="border-b border-[var(--yp-border)] bg-[var(--yp-surface-2)] px-6 py-3.5 flex flex-wrap gap-4 justify-between items-center z-20 relative">
        <div className="font-display font-bold text-xl tracking-tight shrink-0">
          Yield<span style={{ color: config.accent }}>Pet</span>
        </div>
        <AgentBadge personality={personality!} size="sm" />
        <div className="flex items-center gap-3 shrink-0">
          <div className="font-mono text-xs text-[var(--yp-text-muted)] bg-[var(--yp-surface)] px-3 py-1.5 rounded-full border border-[var(--yp-border)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full relative flex">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: config.accent }} />
              <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: config.accent }} />
            </span>
            {activeVault.chainName}
          </div>
          <div className="text-xs font-mono text-[var(--yp-text-muted)]">
            {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : '0x...'}
          </div>
        </div>
      </nav>

      {/* Main grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: `radial-gradient(circle at 10% 50%, rgba(${config.accentRgb}, 0.04) 0%, transparent 60%)` }} />

        {/* Left: Creature panel */}
        <div className="w-full md:w-[380px] lg:w-[440px] shrink-0 border-r border-[var(--yp-border)] bg-[rgba(6,7,10,0.5)] flex flex-col items-center justify-between p-6 relative z-10 overflow-y-auto custom-scrollbar">
          <div className="w-full text-center mb-4">
            <div className="inline-block px-3 py-1 bg-[var(--yp-surface-2)] border border-[var(--yp-border)] rounded-full text-[10px] font-mono text-[var(--yp-text-muted)] uppercase tracking-widest mb-3">
              {creatureState}
            </div>
            <h2 className="font-display font-bold text-2xl mb-1">{creatureName}</h2>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[220px] w-full animate-float">
            <CreatureCanvas
              personality={personality!}
              accent={config.accent}
              accentRgb={config.accentRgb}
              energyLevel={energyLevel}
              creatureState={creatureState}
              size={260}
            />
          </div>

          <div className="w-full mt-6 flex flex-col gap-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass p-4 rounded-xl text-center">
                <div className="text-[10px] text-[var(--yp-text-muted)] font-mono uppercase mb-1">Deposited</div>
                <div className="font-mono text-xl">${depositInfo.amount.toFixed(2)}</div>
              </div>
              <div className="glass p-4 rounded-xl text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]" style={{ background: config.accent }} />
                <div className="text-[10px] text-[var(--yp-text-muted)] font-mono uppercase mb-1">Earned</div>
                <div className="font-mono text-xl animate-count-up" style={{ color: config.accent }}>
                  +${earnedUSD.toFixed(6)}
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-[var(--yp-text-muted)] font-mono">Current Position</div>
              <div className="font-display font-medium text-base mt-1">{activeVault.name}</div>
            </div>

            {/* Vitals */}
            <div className="glass p-5 rounded-xl flex flex-col gap-3.5">
              {[
                { label: 'Yield Health', value: yieldHealth, color: config.accent },
                { label: 'Stability', value: stability, color: stability > 70 ? '#4ade80' : stability > 40 ? '#fbbf24' : '#ef4444' },
                { label: 'Activity', value: activity, color: '#818cf8' },
              ].map(v => (
                <div key={v.label} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[var(--yp-text-secondary)] w-20 text-right uppercase">{v.label}</span>
                  <div className="flex-1 vitals-bar-track">
                    <div className="vitals-bar-fill" style={{ width: `${v.value}%`, background: v.color }} />
                  </div>
                  <span className="font-mono text-[10px] text-[var(--yp-text-muted)] w-8">{v.value}%</span>
                </div>
              ))}
            </div>

            <div className="text-center font-mono text-[10px] text-[var(--yp-text-muted)] uppercase">
              Active for {daysActive > 0 ? `${daysActive} days` : `${hoursActive} hours`}
            </div>
          </div>
        </div>

        {/* Right: Data panel */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar relative z-10 flex flex-col gap-10">
          {showRebalanceAlert && rebalanceTarget && (
            <RebalanceAlert
              personality={personality!}
              currentVault={activeVault}
              targetVault={rebalanceTarget}
              onExecute={handleExecuteRebalance}
              onDismiss={handleDismissRebalance}
            />
          )}

          {/* APY Chart */}
          <section className="animate-fade-in-up">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-mono text-xs text-[var(--yp-text-muted)] uppercase tracking-widest mb-1">Live APY</h3>
                <div className="font-mono text-4xl font-medium" style={{ color: config.accent }}>
                  {activeVault.apy.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-[var(--yp-text-muted)] uppercase tracking-widest mb-1">Stability</div>
                <div className="font-mono text-xl">{(activeVault.stabilityScore * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 border border-[var(--yp-border)]">
              <ApyChart data={apyHistory} accentRgb={config.accentRgb} />
            </div>
          </section>

          {/* Opportunities */}
          <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display font-semibold text-lg">Agent-Ranked Opportunities</h3>
              <span className="font-mono text-[10px] text-[var(--yp-text-muted)] uppercase tracking-wider px-2.5 py-1 bg-[var(--yp-surface-2)] rounded-lg border border-[var(--yp-border)]">
                {config.rankingDescription}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rankedVaults.map((vault, i) => (
                <OpportunityCard
                  key={vault.id}
                  vault={vault}
                  personality={personality!}
                  isActive={vault.id === activeVault.id}
                  isTopPick={i === 0 && config.shouldRebalance(activeVault, vault)}
                />
              ))}
            </div>
          </section>

          {/* Agent log */}
          <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
              Agent Log
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.accent }} />
            </h3>
            <div className="glass rounded-xl p-5 border border-[var(--yp-border)]">
              <AgentLog logs={agentLog} personality={personality!} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
