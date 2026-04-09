import { useEffect } from 'react';
import { motion } from 'framer-motion';
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

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

  // Earnings sim
  useEffect(() => {
    if (!depositInfo || !activeVault) return;
    const interval = setInterval(() => {
      const years = (Date.now() - depositInfo.timestamp) / (1000 * 60 * 60 * 24 * 365);
      setEarnedUSD(depositInfo.amount * (activeVault.apy / 100) * years + Math.random() * 0.000001);
    }, 1000);
    return () => clearInterval(interval);
  }, [depositInfo, activeVault, setEarnedUSD]);

  if (!config || !activeVault || !depositInfo) return null;

  const rankedVaults = getRankedVaults().slice(0, 6);
  const timeMs = Date.now() - depositInfo.timestamp;
  const days = Math.floor(timeMs / 86400000);
  const hours = Math.floor(timeMs / 3600000);

  const vitals = [
    { label: 'Yield Health', value: yieldHealth, color: config.accent },
    { label: 'Stability', value: stability, color: stability > 70 ? '#4ade80' : stability > 40 ? '#fbbf24' : '#ef4444' },
    { label: 'Activity', value: activity, color: '#818cf8' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--yp-bg)' }}>
      {/* Nav */}
      <nav className="border-b border-[var(--yp-border)] bg-[var(--yp-glass-strong)] backdrop-blur-xl px-6 py-3.5 flex flex-wrap gap-4 justify-between items-center z-20 relative">
        <div className="font-display font-extrabold text-xl tracking-tighter shrink-0">
          Yield<span style={{ color: config.accent }}>Pet</span>
        </div>
        <AgentBadge personality={personality!} size="sm" />
        <div className="flex items-center gap-3 shrink-0">
          <div className="font-data text-[10px] text-[var(--yp-text-muted)] bg-[var(--yp-surface)] px-3 py-1.5 rounded-full border border-[var(--yp-border)] flex items-center gap-2 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full relative flex">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: config.accent }} />
              <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: config.accent }} />
            </span>
            {activeVault.chainName}
          </div>
          <div className="font-data text-[10px] text-[var(--yp-text-muted)] uppercase">
            {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : '0x...'}
          </div>
        </div>
      </nav>

      {/* Bento Grid */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar">
        {/* Rebalance alert */}
        {showRebalanceAlert && rebalanceTarget && (
          <motion.div {...fadeUp()} className="mb-6">
            <RebalanceAlert
              personality={personality!}
              currentVault={activeVault}
              targetVault={rebalanceTarget}
              onExecute={() => { setShowRebalanceAlert(false); setScreen('rebalance'); }}
              onDismiss={() => { setShowRebalanceAlert(false); useAppStore.getState().addLogEntry({ message: 'Rebalance dismissed.', type: 'warning' }); }}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 auto-rows-min">
          {/* Creature Panel — spans 4 cols, tall */}
          <motion.div
            {...fadeUp(0)}
            layoutId="creature-container"
            className="md:col-span-4 bento-card p-6 flex flex-col items-center inner-glow-pulse"
          >
            <div className="meta-label mb-2">{creatureState}</div>
            <h2 className="font-display font-extrabold text-2xl tracking-tight mb-1">{creatureName}</h2>

            <div className="flex-1 flex items-center justify-center min-h-[200px] w-full animate-float my-4">
              <CreatureCanvas
                personality={personality!}
                accent={config.accent}
                accentRgb={config.accentRgb}
                energyLevel={energyLevel}
                creatureState={creatureState}
                size={220}
              />
            </div>

            {/* Vitals */}
            <div className="w-full flex flex-col gap-3 mt-auto">
              {vitals.map(v => (
                <div key={v.label} className="flex items-center gap-3">
                  <span className="meta-label w-20 text-right" style={{ opacity: 0.7 }}>{v.label}</span>
                  <div className="flex-1 vitals-bar-track">
                    <div className="vitals-bar-fill" style={{ width: `${v.value}%`, background: v.color }} />
                  </div>
                  <span className="font-data text-[10px] text-[var(--yp-text-muted)] w-8">{v.value}%</span>
                </div>
              ))}
            </div>

            <div className="mt-4 meta-label">
              Active {days > 0 ? `${days}d` : `${hours}h`}
            </div>
          </motion.div>

          {/* Right column group — 8 cols */}
          <div className="md:col-span-8 flex flex-col gap-4 lg:gap-5">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div {...fadeUp(0.05)} className="bento-card p-5 text-center">
                <div className="meta-label mb-2">Deposited</div>
                <div className="font-data text-2xl font-medium">${depositInfo.amount.toFixed(2)}</div>
              </motion.div>
              <motion.div {...fadeUp(0.1)} className="bento-card p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ background: config.accent }} />
                <div className="meta-label mb-2 relative">Earned</div>
                <div className="font-data text-2xl font-medium relative" style={{ color: config.accent }}>
                  +${earnedUSD.toFixed(6)}
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.15)} className="bento-card p-5 text-center">
                <div className="meta-label mb-2">Current APY</div>
                <div className="font-data text-2xl font-medium" style={{ color: config.accent }}>
                  {activeVault.apy.toFixed(2)}%
                </div>
              </motion.div>
            </div>

            {/* APY Chart */}
            <motion.div {...fadeUp(0.15)} className="bento-card p-5">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="meta-label mb-1">Live APY</div>
                  <div className="font-display font-extrabold text-3xl tracking-tight" style={{ color: config.accent }}>
                    {activeVault.apy.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="meta-label mb-1">Stability</div>
                  <div className="font-data text-xl">{(activeVault.stabilityScore * 100).toFixed(0)}%</div>
                </div>
              </div>
              <ApyChart data={apyHistory} accentRgb={config.accentRgb} />
            </motion.div>

            {/* Opportunities */}
            <motion.div {...fadeUp(0.2)}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-extrabold text-lg tracking-tight">Agent-Ranked</h3>
                <span className="meta-label px-3 py-1 bg-[var(--yp-surface)] rounded-full border border-[var(--yp-border)]" style={{ opacity: 1 }}>
                  {config.rankingDescription}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            </motion.div>

            {/* Agent Log */}
            <motion.div {...fadeUp(0.25)} className="bento-card p-5">
              <h3 className="font-display font-extrabold text-lg tracking-tight mb-4 flex items-center gap-2">
                Agent Log
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.accent }} />
              </h3>
              <AgentLog logs={agentLog} personality={personality!} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
