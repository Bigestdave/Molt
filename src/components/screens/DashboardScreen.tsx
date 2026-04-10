import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import { useAgentLogic } from '../../hooks/useAgentLogic';
import { useCreatureState } from '../../hooks/useCreatureState';
import CreatureCanvas from '../creature/CreatureCanvas';
import ApyChart from '../ui/ApyChart';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] },
});

const SECTIONS = ['overview', 'opportunities', 'log'] as const;
type Section = typeof SECTIONS[number];

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
  const addLogEntry = useAppStore((s) => s.addLogEntry);

  const [activeSection, setActiveSection] = useState<Section>('overview');
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<Section, HTMLDivElement | null>>({ overview: null, opportunities: null, log: null });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
  const minutes = Math.floor(timeMs / 60000);

  const vitals = [
    { label: 'YIELD', value: yieldHealth, color: config.accent },
    { label: 'STABILITY', value: stability, color: stability > 70 ? config.accent : stability > 40 ? '#fbbf24' : '#ef4444' },
    { label: 'ACTIVITY', value: activity, color: activity > 50 ? config.accent : '#f59e0b' },
  ];

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const scrollToSection = (section: Section) => {
    setActiveSection(section);
    if (isMobile) {
      sectionRefs.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ═══════ MOBILE LAYOUT ═══════
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--yp-bg)' }}>
        {/* Sticky compact creature header */}
        <div
          className="sticky top-0 z-30 border-b border-[var(--yp-border)]"
          style={{ background: 'rgba(7,7,13,0.95)', backdropFilter: 'blur(24px)' }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3">
            <div className="font-display font-extrabold text-lg tracking-[-0.03em]">
              Yield<span style={{ color: config.accent }}>Pet</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: config.accent, boxShadow: `0 0 8px ${config.accent}` }}
              />
              <span className="font-data text-[10px] text-[var(--yp-text-muted)]">
                {wallet?.slice(0, 6)}...{wallet?.slice(-4)}
              </span>
            </div>
          </div>

          {/* Creature strip — compact horizontal layout */}
          <div className="flex items-center gap-4 px-5 pb-3">
            <div className="shrink-0" style={{ width: 64, height: 64 }}>
              <CreatureCanvas
                personality={personality!}
                accent={config.accent}
                accentRgb={config.accentRgb}
                energyLevel={energyLevel}
                creatureState={creatureState}
                size={64}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-data text-[8px] tracking-[0.12em] px-1.5 py-0.5 rounded"
                  style={{
                    color: config.accent,
                    background: `rgba(${config.accentRgb}, 0.12)`,
                    border: `1px solid rgba(${config.accentRgb}, 0.2)`,
                  }}
                >
                  {creatureState.toUpperCase()}
                </span>
                <span className="font-display font-extrabold text-sm tracking-tight truncate">{creatureName}</span>
              </div>
              {/* Mini vitals row */}
              <div className="flex gap-3">
                {vitals.map(v => (
                  <div key={v.label} className="flex items-center gap-1.5">
                    <div className="w-8 h-[3px] rounded-full bg-[var(--yp-surface-3)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${v.value}%`, background: v.color }} />
                    </div>
                    <span className="font-data text-[8px] text-[var(--yp-text-muted)]">{v.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* APY badge */}
            <div className="text-right shrink-0">
              <div className="font-data text-[22px] font-medium tracking-[-0.03em] leading-none" style={{ color: config.accent }}>
                {activeVault.apy.toFixed(1)}%
              </div>
              <div className="font-data text-[8px] text-[var(--yp-text-muted)] tracking-[0.08em]">APY</div>
            </div>
          </div>

          {/* Section tabs — swipeable nav */}
          <div className="flex border-t border-[var(--yp-border)]">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => scrollToSection(s)}
                className="flex-1 py-2.5 font-data text-[10px] tracking-[0.12em] uppercase transition-colors relative"
                style={{
                  color: activeSection === s ? config.accent : 'var(--yp-text-muted)',
                  background: 'transparent',
                  border: 'none',
                }}
              >
                {s === 'overview' ? '📊 Overview' : s === 'opportunities' ? '🎯 Ranked' : '🤖 Agent'}
                {activeSection === s && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ background: config.accent }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Rebalance alert */}
          {showRebalanceAlert && rebalanceTarget && (
            <div className="px-4 pt-4">
              <div
                className="rounded-2xl p-4 border"
                style={{
                  background: `rgba(${config.accentRgb}, 0.06)`,
                  borderColor: `rgba(${config.accentRgb}, 0.4)`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-[12px]" style={{ color: config.accent }}>⚡ Rebalance</span>
                  <button
                    onClick={() => { setShowRebalanceAlert(false); addLogEntry({ message: 'Rebalance dismissed.', type: 'warning' }); }}
                    className="font-data text-[9px] text-[var(--yp-text-muted)] tracking-[0.08em]"
                  >
                    DISMISS
                  </button>
                </div>
                <p className="font-data text-[11px] text-[var(--yp-text-secondary)] leading-[1.7] mb-3">
                  {config.getRebalanceMessage(activeVault.apy, rebalanceTarget.apy, rebalanceTarget.name)}
                </p>
                <motion.button
                  onClick={() => { setShowRebalanceAlert(false); setScreen('rebalance'); }}
                  className="btn-primary text-[12px] py-2 px-5 w-full"
                  style={{ background: config.accent, borderRadius: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Execute Rebalance →
                </motion.button>
              </div>
            </div>
          )}

          {/* SECTION: Overview */}
          <div ref={el => { sectionRefs.current.overview = el; }} className="px-4 pt-4 pb-2">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'DEPOSITED', value: `$${depositInfo.amount.toFixed(0)}` },
                { label: 'EARNED', value: `+$${earnedUSD.toFixed(4)}`, accent: true },
                { label: 'STAB.', value: `${(activeVault.stabilityScore * 100).toFixed(0)}%` },
              ].map(s => (
                <div key={s.label} className="bg-[var(--yp-surface)] border border-[var(--yp-border)] rounded-xl p-3 text-center">
                  <div className="meta-label mb-1 text-[8px]">{s.label}</div>
                  <div
                    className="font-data text-[13px] font-medium tracking-[-0.01em]"
                    style={s.accent ? { color: config.accent } : {}}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* APY chart */}
            <div className="bento-card p-4 mb-4">
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-data text-[36px] font-medium tracking-[-0.04em] leading-none" style={{ color: config.accent }}>
                    {activeVault.apy.toFixed(2)}
                  </span>
                  <span className="font-data text-[16px]" style={{ color: `rgba(${config.accentRgb}, 0.5)` }}>%</span>
                </div>
                <div className="font-data text-[8px] tracking-[0.1em] text-[var(--yp-text-muted)] bg-[var(--yp-surface-2)] border border-[var(--yp-border)] rounded px-2 py-1">
                  24H
                </div>
              </div>
              <ApyChart data={apyHistory} accentRgb={config.accentRgb} height={100} />
            </div>

            {/* Active position */}
            <div className="bg-[var(--yp-surface)] border border-[var(--yp-border-hover)] rounded-xl p-3.5">
              <div className="meta-label mb-1.5 text-[8px]">ACTIVE POSITION</div>
              <div className="font-display font-bold text-[13px] mb-0.5">{activeVault.name}</div>
              <div className="font-data text-[10px] text-[var(--yp-text-muted)]">
                {activeVault.protocol} • {activeVault.chainName} • {minutes}m active
              </div>
            </div>
          </div>

          {/* SECTION: Opportunities */}
          <div ref={el => { sectionRefs.current.opportunities = el; }} className="px-4 pt-4 pb-2">
            <div className="meta-label mb-3 text-[9px]">AGENT-RANKED POSITIONS</div>
            <div className="flex flex-col gap-2">
              {rankedVaults.map((vault) => {
                const isCurrent = vault.id === activeVault.id;
                const isTopPick = !isCurrent && config.shouldRebalance(activeVault, vault);
                const stabPct = Math.round(vault.stabilityScore * 100);

                return (
                  <div
                    key={vault.id}
                    className="bg-[var(--yp-surface)] border border-[var(--yp-border)] rounded-xl p-3.5 flex items-center gap-3 transition-all"
                    style={
                      isCurrent ? { borderColor: `rgba(${config.accentRgb}, 0.4)` } :
                      isTopPick ? { borderColor: `rgba(${config.accentRgb}, 0.25)` } : {}
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isCurrent && <span className="text-[10px]">📍</span>}
                        <span className="font-display font-bold text-[12px] tracking-tight truncate">{vault.name}</span>
                        <span className="font-data text-[7px] px-1.5 py-0.5 rounded bg-[var(--yp-surface-3)] border border-[var(--yp-border)] text-[var(--yp-text-muted)] shrink-0">
                          {vault.chainName.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-data text-[8px] text-[var(--yp-text-muted)]">STAB</span>
                        <div className="w-12 h-[2px] rounded-full bg-[var(--yp-surface-3)] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${stabPct}%`, background: stabPct > 70 ? config.accent : '#fbbf24' }} />
                        </div>
                        <span className="font-data text-[8px] text-[var(--yp-text-muted)]">{stabPct}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-data text-[18px] font-medium tracking-[-0.02em]" style={{ color: config.accent }}>
                        {vault.apy.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION: Agent Log */}
          <div ref={el => { sectionRefs.current.log = el; }} className="px-4 pt-4 pb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="meta-label text-[9px]">AGENT LOG</div>
              <span
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: config.accent, boxShadow: `0 0 6px ${config.accent}`, animation: 'pulse-dot 1.5s ease-in-out infinite' }}
              />
            </div>
            <div className="bento-card p-3">
              {agentLog.length === 0 ? (
                <div className="font-data text-[11px] text-[var(--yp-text-muted)] py-6 text-center">
                  Agent initializing...
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {agentLog.map((log) => (
                    <div key={log.timestamp} className="flex gap-2.5 px-2 py-2 rounded-lg">
                      <span className="font-data text-[9px] text-[var(--yp-text-muted)] shrink-0 pt-0.5">{fmtTime(log.timestamp)}</span>
                      <span
                        className="font-data text-[10px] leading-[1.6]"
                        style={{
                          color: log.type === 'action' ? config.accent : log.type === 'warning' ? '#f59e0b' : log.type === 'success' ? '#34d399' : 'var(--yp-text-secondary)',
                        }}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════ DESKTOP LAYOUT (unchanged logic, kept as-is) ═══════
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--yp-bg)' }}>
      {/* Nav */}
      <nav className="border-b border-[var(--yp-border)] bg-[rgba(7,7,13,0.9)] backdrop-blur-xl px-8 py-4 flex items-center justify-between z-20 relative">
        <div className="font-display font-extrabold text-xl tracking-[-0.03em]">
          Yield<span style={{ color: config.accent }}>Pet</span>
        </div>
        <div className="flex items-center gap-2.5 bg-[var(--yp-surface-2)] border border-[var(--yp-border-hover)] rounded-full px-4 py-2">
          <span className="text-base">{config.icon}</span>
          <span className="font-display font-bold text-[13px]">{config.name}</span>
          <span className="font-data text-[9px] tracking-[0.1em]" style={{ color: config.accent }}>
            {config.riskTag.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-data text-[11px] text-[var(--yp-text-secondary)]">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: config.accent,
                boxShadow: `0 0 8px ${config.accent}`,
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            {activeVault.chainName}
          </div>
          <span className="font-data text-[11px] text-[var(--yp-text-muted)]">
            {wallet || '0x...'}
          </span>
        </div>
      </nav>

      {/* Dashboard body */}
      <div className="flex-1 grid grid-cols-[380px_1fr] gap-0 overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
        {/* ═══════ LEFT: CREATURE PANEL ═══════ */}
        <div className="border-r border-[var(--yp-border)] flex flex-col overflow-y-auto custom-scrollbar">
          {/* Creature canvas */}
          <motion.div
            {...fadeUp(0)}
            layoutId="creature-container"
            className="flex flex-col items-center px-6 pt-8 pb-4 relative"
            style={{
              background: `radial-gradient(ellipse at 50% 60%, rgba(${config.accentRgb}, 0.06) 0%, transparent 70%)`,
            }}
          >
            <div className="animate-float mb-4" style={{ minHeight: 220 }}>
              <CreatureCanvas
                personality={personality!}
                accent={config.accent}
                accentRgb={config.accentRgb}
                energyLevel={energyLevel}
                creatureState={creatureState}
                size={220}
              />
            </div>

            <div
              className="font-data text-[9px] tracking-[0.15em] px-2 py-0.5 rounded mb-1.5"
              style={{
                color: config.accent,
                background: `rgba(${config.accentRgb}, 0.12)`,
                border: `1px solid rgba(${config.accentRgb}, 0.25)`,
              }}
            >
              {creatureState.toUpperCase()}
            </div>
            <h2 className="font-display font-extrabold text-[22px] tracking-[-0.03em]">{creatureName}</h2>
          </motion.div>

          {/* Active position card */}
          <div className="mx-6 mb-4 bg-[var(--yp-surface)] border border-[var(--yp-border-hover)] rounded-xl p-3.5">
            <div className="meta-label mb-2">ACTIVE POSITION</div>
            <div className="font-display font-bold text-[13px] mb-1">{activeVault.name}</div>
            <div className="font-data text-[10px] text-[var(--yp-text-muted)]">
              {activeVault.protocol} • {activeVault.chainName} • {activeVault.apy.toFixed(2)}% APY
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mx-6 mb-4">
            {[
              { label: 'DEPOSITED', value: `$${depositInfo.amount.toFixed(2)}` },
              { label: 'EARNED', value: `+$${earnedUSD.toFixed(6)}`, accent: true },
              { label: 'APY', value: `${activeVault.apy.toFixed(2)}%`, accent: true },
            ].map(s => (
              <div key={s.label} className="bg-[var(--yp-surface)] border border-[var(--yp-border)] rounded-xl p-3 text-center">
                <div className="meta-label mb-1">{s.label}</div>
                <div
                  className="font-data text-[14px] font-medium tracking-[-0.01em]"
                  style={s.accent ? { color: config.accent } : {}}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Vitals */}
          <div className="px-6 py-4 border-t border-[var(--yp-border)] flex-1">
            <div className="meta-label mb-4">VITALS</div>
            {vitals.map(v => (
              <div key={v.label} className="flex items-center gap-3 mb-3.5">
                <span className="font-data text-[10px] text-[var(--yp-text-muted)] w-[65px] shrink-0 tracking-[0.06em]">
                  {v.label}
                </span>
                <div className="vitals-bar-track flex-1">
                  <div className="vitals-bar-fill" style={{ width: `${v.value}%`, background: v.color }} />
                </div>
                <span className="font-data text-[10px] text-[var(--yp-text-secondary)] w-8 text-right">{v.value}%</span>
              </div>
            ))}
            <div className="font-data text-[10px] text-[var(--yp-text-muted)] tracking-[0.08em] text-center mt-2">
              ACTIVE · {minutes}M
            </div>
          </div>
        </div>

        {/* ═══════ RIGHT: DATA PANEL ═══════ */}
        <div className="overflow-y-auto custom-scrollbar p-7 flex flex-col gap-6">
          {/* Rebalance alert */}
          {showRebalanceAlert && rebalanceTarget && (
            <motion.div {...fadeUp()}>
              <div
                className="rounded-2xl p-5 border"
                style={{
                  background: `rgba(${config.accentRgb}, 0.06)`,
                  borderColor: `rgba(${config.accentRgb}, 0.4)`,
                }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 font-display font-bold text-[13px]" style={{ color: config.accent }}>
                    ⚡ Rebalance Opportunity
                  </div>
                  <button
                    onClick={() => { setShowRebalanceAlert(false); addLogEntry({ message: 'Rebalance dismissed.', type: 'warning' }); }}
                    className="font-data text-[10px] text-[var(--yp-text-muted)] tracking-[0.08em] hover:text-[var(--yp-text)] cursor-pointer"
                  >
                    DISMISS
                  </button>
                </div>
                <p className="font-data text-[12px] text-[var(--yp-text-secondary)] leading-[1.7] mb-4">
                  {config.getRebalanceMessage(activeVault.apy, rebalanceTarget.apy, rebalanceTarget.name)}
                </p>
                <motion.button
                  onClick={() => { setShowRebalanceAlert(false); setScreen('rebalance'); }}
                  className="btn-primary text-[13px] py-2.5 px-6"
                  style={{ background: config.accent, borderRadius: 8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Execute Rebalance →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* APY Chart */}
          <motion.div {...fadeUp(0.1)} className="bento-card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="meta-label mb-2">LIVE APY</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-data text-[52px] font-medium tracking-[-0.04em] leading-none" style={{ color: config.accent }}>
                    {activeVault.apy.toFixed(2)}
                  </span>
                  <span className="font-data text-[20px]" style={{ color: `rgba(${config.accentRgb}, 0.6)` }}>%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-data text-[9px] tracking-[0.1em] text-[var(--yp-text-muted)] bg-[var(--yp-surface-2)] border border-[var(--yp-border)] rounded px-2 py-1">
                  STABILITY {(activeVault.stabilityScore * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <ApyChart data={apyHistory} accentRgb={config.accentRgb} height={120} />
          </motion.div>

          {/* Opportunities */}
          <motion.div {...fadeUp(0.15)}>
            <div className="flex items-center justify-between mb-4">
              <div className="meta-label" style={{ opacity: 1 }}>AGENT-RANKED</div>
              <div className="font-data text-[9px] tracking-[0.1em] text-[var(--yp-text-muted)] bg-[var(--yp-surface-2)] border border-[var(--yp-border)] rounded px-2 py-1">
                {config.rankingDescription.toUpperCase()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {rankedVaults.map((vault) => {
                const isCurrent = vault.id === activeVault.id;
                const isTopPick = !isCurrent && config.shouldRebalance(activeVault, vault);
                const stabPct = Math.round(vault.stabilityScore * 100);

                return (
                  <div
                    key={vault.id}
                    className="bg-[var(--yp-surface-2)] border border-[var(--yp-border)] rounded-xl p-4 relative transition-all hover:border-[var(--yp-border-hover)]"
                    style={
                      isCurrent ? { borderColor: `rgba(${config.accentRgb}, 0.4)` } :
                      isTopPick ? { borderColor: `rgba(${config.accentRgb}, 0.6)` } : {}
                    }
                  >
                    {isCurrent && <span className="absolute top-3 right-3 text-[12px]">📍</span>}
                    <div className="font-display font-bold text-[13px] tracking-[-0.01em] mb-1">{vault.name}</div>
                    <div className="flex items-center gap-1.5 font-data text-[10px] text-[var(--yp-text-muted)] mb-3">
                      <span className="capitalize">{vault.protocol.replace('-', ' ')}</span>
                      <span className="px-1.5 py-0 rounded bg-[var(--yp-surface-3)] text-[8px] border border-[var(--yp-border)]">
                        {vault.chainName.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-data text-[20px] font-medium tracking-[-0.02em] mb-2" style={{ color: config.accent }}>
                      {vault.apy.toFixed(2)}%
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-data text-[9px] text-[var(--yp-text-muted)] tracking-[0.08em]">STABILITY</span>
                      <div className="stability-bar flex-1">
                        <div className="stability-bar-fill" style={{ width: `${stabPct}%`, background: stabPct > 70 ? config.accent : stabPct > 40 ? '#fbbf24' : '#ef4444' }} />
                      </div>
                      <span className="font-data text-[9px] text-[var(--yp-text-secondary)]">{stabPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Agent Log */}
          <motion.div {...fadeUp(0.2)} className="bento-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="meta-label" style={{ opacity: 1 }}>AGENT LOG</div>
              <span
                className="w-[7px] h-[7px] rounded-full"
                style={{ background: config.accent, boxShadow: `0 0 8px ${config.accent}`, animation: 'pulse-dot 1.5s ease-in-out infinite' }}
              />
            </div>
            <div className="flex flex-col gap-0.5 max-h-[260px] overflow-y-auto custom-scrollbar">
              {agentLog.length === 0 ? (
                <div className="font-data text-[11px] text-[var(--yp-text-muted)] py-6 text-center">
                  Agent initializing observation protocols...
                </div>
              ) : (
                agentLog.map((log) => (
                  <div key={log.timestamp} className="flex gap-3.5 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--yp-surface-2)]">
                    <span className="font-data text-[10px] text-[var(--yp-text-muted)] shrink-0 pt-0.5 tracking-[0.05em]">
                      [{fmtTime(log.timestamp)}]
                    </span>
                    <span
                      className="font-data text-[11px] leading-[1.6]"
                      style={{
                        color: log.type === 'action' ? config.accent : log.type === 'warning' ? '#f59e0b' : log.type === 'success' ? '#34d399' : 'var(--yp-text-secondary)',
                      }}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
