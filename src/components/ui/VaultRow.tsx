import type { NormalizedVault } from '../../store/appStore';
import StabilityBar from './StabilityBar';
import { getPersonality } from '../../lib/personalities';
import type { PersonalityType } from '../../lib/personalities';

interface VaultRowProps {
  vault: NormalizedVault;
  isSelected?: boolean;
  onSelect?: (vault: NormalizedVault) => void;
  personality: PersonalityType;
}

export default function VaultRow({ vault, isSelected, onSelect, personality }: VaultRowProps) {
  const config = getPersonality(personality);

  return (
    <div
      onClick={() => onSelect?.(vault)}
      className={`vault-row flex items-center justify-between p-4 rounded-xl border ${
        isSelected ? 'selected' : 'border-[var(--yp-border)] hover:border-[var(--yp-border-hover)]'
      }`}
      style={isSelected && config ? { borderColor: config.accent } : {}}
      role="button"
      tabIndex={0}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-semibold text-[15px] truncate">{vault.name}</h3>
          <span className="chip px-2 py-0.5 text-[10px] hide-mobile">{vault.chainName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--yp-text-muted)]">
          <span className="capitalize">{vault.protocol.replace('-', ' ')}</span>
          <span>•</span>
          <span className="font-mono">${(vault.tvlUsd / 1_000_000).toFixed(1)}M TVL</span>
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="w-[80px] shrink-0 hide-mobile">
          <div className="text-[10px] text-[var(--yp-text-muted)] mb-1 text-right">Stability</div>
          <StabilityBar score={vault.stabilityScore} accentRgb={config?.accentRgb} showLabel={false} />
        </div>
        <div className="w-[80px] shrink-0 text-right">
          <div className="text-[10px] text-[var(--yp-text-muted)] mb-1">APY</div>
          <div className="font-mono font-medium text-[15px]">{vault.apy.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
}
