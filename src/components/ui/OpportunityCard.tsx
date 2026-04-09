import type { NormalizedVault } from '../../store/appStore';
import { getPersonality } from '../../lib/personalities';
import type { PersonalityType } from '../../lib/personalities';
import StabilityBar from './StabilityBar';

interface OpportunityCardProps {
  vault: NormalizedVault & { personalityScore?: number };
  personality: PersonalityType;
  isActive?: boolean;
  isTopPick?: boolean;
}

export default function OpportunityCard({ vault, personality, isActive, isTopPick }: OpportunityCardProps) {
  const config = getPersonality(personality);

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 ${
        isActive
          ? 'glass border-[var(--yp-border)]'
          : isTopPick
          ? 'glass border-[var(--yp-border)] shadow-lg hover:shadow-xl'
          : 'border-[var(--yp-border)] hover:border-[var(--yp-border-hover)] bg-[var(--yp-surface)] hover:bg-[var(--yp-surface-2)]'
      }`}
      style={isActive ? { borderColor: 'var(--yp-text-muted)' } : isTopPick && config ? { borderColor: config.accent } : {}}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-[var(--yp-surface)] border border-[var(--yp-border)] rounded-full p-1 text-xs z-10 w-6 h-6 flex items-center justify-center">
          📍
        </div>
      )}
      {isTopPick && config && (
        <div
          className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 z-10"
          style={{ background: config.accent, color: 'var(--yp-bg)' }}
        >
          <span>{config.icon}</span> Top Pick
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-display font-semibold text-sm truncate max-w-[160px]">{vault.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[var(--yp-text-muted)] capitalize">{vault.protocol.replace('-', ' ')}</span>
            <span className="text-[var(--yp-text-muted)] text-[10px]">•</span>
            <span className="chip px-1.5 py-0 text-[9px]">{vault.chainName}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--yp-text-muted)] font-mono mb-1">APY</div>
          <div className="font-mono text-base font-medium" style={{ color: isTopPick && config ? config.accent : 'inherit' }}>
            {vault.apy.toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="flex justify-between items-end gap-4">
        <div className="flex-1">
          <div className="text-[10px] text-[var(--yp-text-muted)] font-mono mb-1">Stability Score</div>
          <StabilityBar score={vault.stabilityScore} accentRgb={config?.accentRgb} />
        </div>
        {vault.personalityScore !== undefined && config && (
          <div className="text-right">
            <div className="text-[10px] text-[var(--yp-text-muted)] font-mono mb-1" title={config.rankingDescription}>Agent Score</div>
            <div className="font-mono text-xs">{vault.personalityScore.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
