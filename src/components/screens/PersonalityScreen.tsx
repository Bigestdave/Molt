import { useEffect, useState } from 'react';
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

  const handleContinue = () => {
    if (selectedPersonality) setScreen('vaultSelect');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 transition-all duration-1000 pointer-events-none"
        style={{
          background: selectedPersonality
            ? `radial-gradient(ellipse at 50% 80%, rgba(${personalities[selectedPersonality].accentRgb}, 0.1) 0%, transparent 55%)`
            : 'radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.02) 0%, transparent 55%)',
        }}
      />

      <div className="max-w-5xl w-full z-10">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--yp-border)] bg-[var(--yp-surface)] text-[var(--yp-text-muted)] text-xs font-mono mb-8 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--yp-success)] animate-pulse" />
            Autonomous DeFi Agent
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 tracking-tight leading-[1.05]">
            Your yield,{' '}
            <span
              className="italic transition-colors duration-500"
              style={{ color: selectedPersonality ? personalities[selectedPersonality].accent : 'var(--yp-text)' }}
            >
              alive.
            </span>
          </h1>
          <p className="font-mono text-[var(--yp-text-secondary)] text-sm md:text-[15px] max-w-lg mx-auto leading-relaxed">
            Select an autonomous agent to manage your DeFi positions.
            Its visual state will reflect your yield health in real time.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14 stagger-children">
          {Object.values(personalities).map((p) => {
            const isSelected = selectedPersonality === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`personality-card glass p-6 rounded-2xl border-2 animate-fade-in-up ${
                  isSelected ? 'selected glow-accent' : 'border-[var(--yp-border)] hover:border-[var(--yp-border-hover)]'
                }`}
                style={isSelected ? { borderColor: p.accent } : {}}
              >
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div className="text-4xl">{p.icon}</div>
                  <div
                    className="font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider"
                    style={{
                      background: isSelected ? p.accent : 'var(--yp-surface-2)',
                      color: isSelected ? 'var(--yp-bg)' : 'var(--yp-text-secondary)',
                    }}
                  >
                    {p.riskTag}
                  </div>
                </div>

                <h3 className="font-display font-bold text-2xl mb-2 relative z-10">{p.name}</h3>
                <p className="font-display font-medium text-sm mb-4 relative z-10 transition-colors duration-300"
                  style={{ color: p.accent }}>
                  {p.tagline}
                </p>
                <p className="text-[var(--yp-text-muted)] text-sm leading-relaxed mb-6 h-[72px] relative z-10">
                  {p.description}
                </p>

                <div className="bg-[var(--yp-surface)] rounded-xl p-3 relative z-10 border border-[var(--yp-border)]">
                  <div className="text-[10px] text-[var(--yp-text-muted)] font-mono mb-1 uppercase tracking-wider">Logic Engine</div>
                  <div className="font-mono text-xs text-[var(--yp-text-secondary)] leading-tight">{p.rebalanceLogic}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex justify-center transition-all duration-500 relative z-10"
          style={{ opacity: selectedPersonality ? 1 : 0.3, transform: selectedPersonality ? 'translateY(0)' : 'translateY(8px)' }}>
          <button disabled={!selectedPersonality} onClick={handleContinue} className="btn-primary text-lg px-14 py-4 glow-accent-strong">
            Hatch my pet →
          </button>
        </div>
      </div>
    </div>
  );
}
