import type { NormalizedVault } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import type { PersonalityType } from '../../lib/personalities';

interface RebalanceAlertProps {
  personality: PersonalityType;
  currentVault: NormalizedVault;
  targetVault: NormalizedVault;
  onExecute: () => void;
  onDismiss: () => void;
}

export default function RebalanceAlert({ personality, currentVault, targetVault, onExecute, onDismiss }: RebalanceAlertProps) {
  const config = getPersonality(personality);
  if (!config) return null;

  return (
    <div className="rebalance-alert glass glow-accent">
      <div className="flex items-start gap-4 mb-5">
        <div className="text-3xl shrink-0 mt-1">{config.icon}</div>
        <div>
          <h3 className="font-display font-semibold text-lg mb-1.5 flex items-center gap-2">
            Rebalance Opportunity
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: config.accent }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: config.accent }}></span>
            </span>
          </h3>
          <p className="text-sm text-[var(--yp-text-secondary)] leading-relaxed">
            "{config.getRebalanceMessage(currentVault.apy, targetVault.apy, targetVault.name)}"
          </p>
        </div>
      </div>

      <div className="bg-[var(--yp-surface)] rounded-xl p-4 border border-[var(--yp-border)] mb-5">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-mono text-[var(--yp-text-muted)]">Current</div>
          <div className="text-xs font-mono text-[var(--yp-text-muted)]">Target</div>
        </div>
        <div className="flex justify-between items-center relative">
          <div className="flex-1">
            <div className="font-display font-medium text-sm truncate pr-4">{currentVault.name}</div>
            <div className="font-mono text-[var(--yp-text-secondary)] text-xs mt-1">{currentVault.apy.toFixed(2)}% APY</div>
          </div>
          <div className="shrink-0 text-[var(--yp-text-muted)] absolute left-1/2 -translate-x-1/2 text-lg">→</div>
          <div className="flex-1 text-right">
            <div className="font-display font-medium text-sm truncate pl-4" style={{ color: config.accent }}>{targetVault.name}</div>
            <div className="font-mono text-xs mt-1" style={{ color: config.accent }}>{targetVault.apy.toFixed(2)}% APY</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onExecute} className="btn-primary flex-1 py-3 text-sm" style={{ background: config.accent }}>
          Execute Rebalance →
        </button>
        <button onClick={onDismiss} className="btn-secondary py-3 px-6 text-sm">
          Dismiss
        </button>
      </div>
    </div>
  );
}
