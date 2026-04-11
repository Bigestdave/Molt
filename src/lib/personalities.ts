import type { FC } from 'react';
import type { AgentIconProps } from '../components/icons/AgentIcons';
import { KeeperIcon, HunterIcon, ArchitectIcon } from '../components/icons/AgentIcons';

export type PersonalityType = 'steward' | 'hunter' | 'sentinel';

export interface PersonalityConfig {
  id: PersonalityType;
  name: string;
  icon: FC<AgentIconProps>;
  accent: string;
  accentRgb: string;
  riskTag: string;
  tagline: string;
  description: string;
  rebalanceLogic: string;
  creatureSpeed: number;
  voiceStyle: string[];
  rankingDescription: string;
  rankVault: (vault: { apy: number; stabilityScore: number; tvlUsd?: number }, maxApy: number) => number;
  shouldRebalance: (current: { apy: number; stabilityScore: number; compositeScore?: number }, target: { apy: number; stabilityScore: number; compositeScore?: number }) => boolean;
  getInsight: (vaultName: string, apy: number, stabilityScore: number) => string;
  getRebalanceMessage: (currentApy: number, targetApy: number, targetName: string) => string;
  getBreakevenReasoning: (analysis: { bridgeFeeUsd: number; breakEvenDays: number; apyDelta: number; profitable: boolean }, targetName: string) => string;
  shouldRebalanceWithFees: (analysis: { bridgeFeeUsd: number; breakEvenDays: number; profitable: boolean }) => boolean;
  getIdleMessages: () => string[];
}

const stewardMessages = [
  "Your capital is resting well.",
  "No action needed. Monitoring.",
  "Stability remains strong. Holding position.",
  "Markets are steady. Your yield is secure.",
  "Watching for safer harbors, but this one holds firm.",
  "Patience is the highest yield. Holding.",
  "Risk metrics within parameters. All clear.",
  "The vault remains solid. No urgency.",
];

const hunterMessages = [
  "Scanning for higher yield...",
  "Current rate could be better. Watching.",
  "Markets moving. Looking for an opening.",
  "Rate is acceptable, but I've seen better.",
  "Competitors are offering more. Evaluating options.",
  "Capital should always be working harder.",
  "Restless. There's yield on the table somewhere.",
  "APY dipped slightly. Eyes on alternatives.",
];

const sentinelMessages = [
  "Running composite score analysis...",
  "Risk-adjusted metrics within expected range.",
  "Monitoring TVL shifts across protocols.",
  "Calculating optimal risk-reward position.",
  "Stability coefficient: stable. APY coefficient: tracking.",
  "Cross-referencing protocol metrics. Standby.",
  "Variance analysis complete. Current position holds.",
  "Risk model updated. No action triggered.",
];

export const personalities: Record<PersonalityType, PersonalityConfig> = {
  steward: {
    id: 'steward',
    name: 'The Keeper',
    icon: KeeperIcon,
    accent: '#4ade80',
    accentRgb: '74, 222, 128',
    riskTag: 'Conservative',
    tagline: 'Preserve capital. Sleep well.',
    description: 'Prioritizes stability and safety over raw returns. Moves slowly and only to stronger positions.',
    rebalanceLogic: 'Moves when stability > 0.65 AND APY > 15% higher',
    creatureSpeed: 1.5,
    voiceStyle: stewardMessages,
    rankingDescription: 'TVL-weighted stability (85% safety, 15% yield)',
    rankVault: (vault) => {
      // AEGIS: 85% stability from TVL, 15% normalized APY — always picks the safest vault
      const tvlUsd = vault.tvlUsd ?? 0;
      const stability = Math.min(tvlUsd / 100_000_000, 1.0);
      const normalizedApy = Math.min(vault.apy / 20, 1.0);
      return (stability * 0.85) + (normalizedApy * 0.15);
    },
    shouldRebalance: (current, target) => target.stabilityScore > 0.65 && target.apy > current.apy * 1.15 && target.stabilityScore >= 0.6,
    getInsight: (vaultName, apy, stabilityScore) => {
      if (stabilityScore > 0.7) {
        return `${vaultName} shows strong fundamentals. A stability score of ${(stabilityScore * 100).toFixed(0)}% gives me confidence here. The ${apy.toFixed(2)}% APY is a fair return for the level of safety provided.`;
      }
      return `${vaultName} offers ${apy.toFixed(2)}% APY, but the stability score of ${(stabilityScore * 100).toFixed(0)}% gives me pause. I'd recommend monitoring closely.`;
    },
    getRebalanceMessage: (currentApy, targetApy, targetName) =>
      `A steadier position has emerged. ${targetName} offers ${targetApy.toFixed(2)}% APY with stronger stability — up from your current ${currentApy.toFixed(2)}%. I recommend we move.`,
    getIdleMessages: () => stewardMessages,
  },

  hunter: {
    id: 'hunter',
    name: 'The Hunter',
    icon: HunterIcon,
    accent: '#f97316',
    accentRgb: '249, 115, 22',
    riskTag: 'Aggressive',
    tagline: 'Maximum yield. No hesitation.',
    description: 'Pure APY maximizer. Chases the highest returns regardless of stability metrics.',
    rebalanceLogic: 'Moves when any vault offers 1.5× current APY',
    creatureSpeed: 3.5,
    voiceStyle: hunterMessages,
    rankingDescription: 'Pure APY — highest yield wins',
    rankVault: (vault) => vault.apy, // 100% APY driven, ignores risk entirely
    shouldRebalance: (current, target) => target.apy > current.apy * 1.5,
    getInsight: (vaultName, apy) => {
      if (apy > 15) {
        return `${vaultName} — ${apy.toFixed(2)}% APY. Now we're talking. This is where capital should be working. Let's move.`;
      }
      return `${vaultName} at ${apy.toFixed(2)}% APY. Acceptable, but I know there's better out there. Let's deploy here and keep hunting.`;
    },
    getRebalanceMessage: (currentApy, targetApy, targetName) =>
      `Better yield found. ${targetName} is offering ${targetApy.toFixed(2)}% — that's ${(targetApy / currentApy).toFixed(1)}× your current ${currentApy.toFixed(2)}%. Moving.`,
    getIdleMessages: () => hunterMessages,
  },

  sentinel: {
    id: 'sentinel',
    name: 'The Architect',
    icon: ArchitectIcon,
    accent: '#818cf8',
    accentRgb: '129, 140, 248',
    riskTag: 'Analytical',
    tagline: 'Data-driven. Risk-adjusted.',
    description: 'Uses composite risk-adjusted scoring to find optimal positions. Shows its math.',
    rebalanceLogic: 'Moves when composite score is 20% higher',
    creatureSpeed: 2.0,
    voiceStyle: sentinelMessages,
    rankingDescription: 'Risk-adjusted composite (APY × TVL stability)',
    rankVault: (vault) => {
      // NEXUS: Sharpe-ratio style — caps APY at 30% to avoid outlier distortion, then multiplies by TVL stability
      const tvlUsd = vault.tvlUsd ?? 0;
      const stability = Math.min(tvlUsd / 50_000_000, 1.0);
      const cappedApy = Math.min(vault.apy, 30);
      return cappedApy * stability;
    },
    shouldRebalance: (current, target) => {
      const currentScore = current.apy * current.stabilityScore;
      const targetScore = target.apy * target.stabilityScore;
      return targetScore > currentScore * 1.2;
    },
    getInsight: (vaultName, apy, stabilityScore) => {
      const composite = (apy * stabilityScore).toFixed(2);
      return `${vaultName} analysis complete. APY: ${apy.toFixed(2)}% × Stability: ${(stabilityScore * 100).toFixed(0)}% = Composite: ${composite}. ${parseFloat(composite) > 5 ? 'Risk-adjusted return is favorable.' : 'Composite score is moderate.'}`;
    },
    getRebalanceMessage: (_currentApy, targetApy, targetName) =>
      `Composite score analysis complete. ${targetName} scores higher on risk-adjusted metrics — ${targetApy.toFixed(2)}% APY with improved stability. Recommending move.`,
    getIdleMessages: () => sentinelMessages,
  },
};

export function getPersonality(id: PersonalityType | null): PersonalityConfig | null {
  if (!id) return null;
  return personalities[id] || null;
}
