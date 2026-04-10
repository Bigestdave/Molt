import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { personalities } from '../../lib/personalities';
import type { PersonalityType } from '../../lib/personalities';

const cardColors: Record<PersonalityType, { color: string; rgb: string; accent: string }> = {
  steward: { color: '#4ade80', rgb: '74,222,128', accent: 'rgba(74,222,128,0.08)' },
  hunter: { color: '#f97316', rgb: '249,115,22', accent: 'rgba(249,115,22,0.08)' },
  sentinel: { color: '#818cf8', rgb: '129,140,248', accent: 'rgba(129,140,248,0.08)' },
};

export default function PersonalityScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const selectedPersonality = useAppStore((s) => s.personality);
  const setPersonality = useAppStore((s) => s.setPersonality);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSelect = (id: PersonalityType) => {
    setPersonality(id);
    document.documentElement.style.setProperty('--yp-accent', personalities[id].accent);
    document.documentElement.style.setProperty('--yp-accent-rgb', personalities[id].accentRgb);
  };

  if (!mounted) return null;

  const selected = selectedPersonality ? personalities[selectedPersonality] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: selected
            ? `radial-gradient(600px at 50% -100px, rgba(${selected.accentRgb}, 0.12) 0%, transparent 60%)`
            : undefined,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: selected
            ? `radial-gradient(400px at 80% 100%, rgba(${selected.accentRgb}, 0.06) 0%, transparent 60%)`
            : undefined,
        }}
      />

      <div className="max-w-[900px] w-full z-10">
        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--yp-border-hover)] bg-[var(--yp-surface-2)]">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: selected?.accent || 'var(--yp-success)',
                boxShadow: `0 0 8px ${selected?.accent || 'var(--yp-success)'}`,
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <span className="font-data text-[10px] tracking-[0.15em] text-[var(--yp-text-secondary)]">
              AUTONOMOUS DEFI AGENT
            </span>
          </div>
        </motion.div>

        {/* Hero headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-6"
        >
          <h1 className="font-display font-extrabold leading-[0.92] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(56px, 9vw, 120px)' }}>
            Your yield,{' '}
            <em
              className="block italic transition-colors duration-800"
              style={{ color: selected?.accent || 'var(--yp-text)', fontStyle: 'italic' }}
            >
              alive.
            </em>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-data text-[13px] text-[var(--yp-text-secondary)] text-center max-w-[480px] mx-auto leading-[1.7] mb-16"
        >
          Select an autonomous agent personality. It will
          manage your DeFi positions while its visual state
          reflects your yield health.
        </motion.p>

        {/* Personality Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {(Object.keys(personalities) as PersonalityType[]).map((id, i) => {
            const p = personalities[id];
            const cc = cardColors[id];
            const isSelected = selectedPersonality === id;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => handleSelect(id)}
                className={`personality-card bento-card p-7 ${isSelected ? 'selected' : ''}`}
                style={{
                  '--card-color': cc.color,
                  '--card-rgb': cc.rgb,
                  '--card-accent': cc.accent,
                } as React.CSSProperties}
                whileTap={{ scale: 0.97 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-[28px] leading-none">{p.icon}</div>
                  <span
                    className="font-data text-[9px] tracking-[0.12em] px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: 'var(--yp-border-hover)',
                      color: isSelected ? cc.color : 'var(--yp-text-muted)',
                      background: isSelected ? `rgba(${cc.rgb}, 0.1)` : 'transparent',
                    }}
                  >
                    {p.riskTag.toUpperCase()}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-display font-extrabold text-[22px] tracking-[-0.02em] mb-1.5">{p.name}</h3>
                <p className="text-[12px] font-semibold mb-4" style={{ color: cc.color }}>{p.tagline}</p>

                {/* Desc */}
                <p className="font-data text-[11px] text-[var(--yp-text-secondary)] leading-[1.75] mb-5">
                  {p.description}
                </p>

                {/* Logic */}
                <div className="pt-4 border-t border-[var(--yp-border)]">
                  <div className="font-data text-[10px] text-[var(--yp-text-muted)] leading-[1.6]">
                    Score = <span style={{ color: cc.color }}>
                      {id === 'steward' ? 'stability × 0.65 + APY × 0.35' :
                       id === 'hunter' ? 'APY (pure)' :
                       'APY × stability'}
                    </span>
                    <br />
                    {p.rebalanceLogic}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="flex justify-center"
          animate={{ opacity: selectedPersonality ? 1 : 0.35 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            disabled={!selectedPersonality}
            onClick={() => selectedPersonality && setScreen('vaultSelect')}
            className="btn-primary text-[15px]"
            style={selectedPersonality && selected ? {
              background: selected.accent,
              boxShadow: `0 0 40px rgba(${selected.accentRgb}, 0.4)`,
            } : {}}
            whileTap={{ scale: 0.95 }}
          >
            Hatch with {selected?.name || 'your agent'} →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
