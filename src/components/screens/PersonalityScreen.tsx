import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { personalities } from '../../lib/personalities';
import type { PersonalityType } from '../../lib/personalities';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
      {/* Ambient */}
      <div
        className="fixed inset-0 transition-all duration-1000 pointer-events-none"
        style={{
          background: selectedPersonality
            ? `radial-gradient(ellipse at 50% 90%, rgba(${personalities[selectedPersonality].accentRgb}, 0.08) 0%, transparent 50%)`
            : undefined,
        }}
      />

      <div className="max-w-5xl w-full z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--yp-border)] bg-[var(--yp-surface)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--yp-success)] animate-pulse" />
            <span className="meta-label" style={{ opacity: 1, fontSize: '11px' }}>Autonomous DeFi Agent</span>
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.95] mb-7">
            Your yield,{' '}
            <span
              className="italic transition-colors duration-500"
              style={{ color: selectedPersonality ? personalities[selectedPersonality].accent : 'var(--yp-text)' }}
            >
              alive.
            </span>
          </h1>
          <p className="font-data text-[var(--yp-text-secondary)] text-xs md:text-sm max-w-md mx-auto leading-relaxed opacity-70">
            Select an autonomous agent personality. It will manage your DeFi
            positions while its visual state reflects your yield health.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {Object.values(personalities).map((p, i) => {
            const isSelected = selectedPersonality === p.id;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => handleSelect(p.id)}
                className={`personality-card bento-card p-7 cursor-pointer ${isSelected ? 'selected glow-accent' : ''}`}
                style={isSelected ? { borderColor: p.accent } : {}}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl">{p.icon}</div>
                  <div
                    className="font-data text-[10px] uppercase font-medium px-3 py-1 rounded-full tracking-wider"
                    style={{
                      background: isSelected ? p.accent : 'var(--yp-surface-2)',
                      color: isSelected ? 'var(--yp-bg)' : 'var(--yp-text-secondary)',
                    }}
                  >
                    {p.riskTag}
                  </div>
                </div>

                <h3 className="font-display font-extrabold text-2xl tracking-tight mb-2">{p.name}</h3>
                <p className="font-display font-medium text-sm mb-4 transition-colors" style={{ color: p.accent }}>
                  {p.tagline}
                </p>
                <p className="text-[var(--yp-text-muted)] text-sm leading-relaxed mb-6 h-[68px]">
                  {p.description}
                </p>

                <div className="bg-[var(--yp-surface)] rounded-2xl p-3.5 border border-[var(--yp-border)]">
                  <div className="meta-label mb-1.5">Logic Engine</div>
                  <div className="font-data text-xs text-[var(--yp-text-secondary)] leading-snug">{p.rebalanceLogic}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="flex justify-center"
          animate={{ opacity: selectedPersonality ? 1 : 0.25, y: selectedPersonality ? 0 : 8 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            disabled={!selectedPersonality}
            onClick={() => selectedPersonality && setScreen('vaultSelect')}
            className="btn-primary text-lg px-16 py-5 glow-accent-strong"
            whileTap={{ scale: 0.95 }}
          >
            Hatch my pet →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
