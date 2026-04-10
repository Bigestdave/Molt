interface ChainIconProps {
  size?: number;
  className?: string;
}

/** All Chains — concentric rings */
function AllChainsIcon({ size = 14, className }: ChainIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/** Ethereum — diamond / ⟠ shape */
function EthereumIcon({ size = 14, className }: ChainIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 1.5 L13 8 L8 10.5 L3 8 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.7" />
      <path d="M8 10.5 L13 8 L8 14.5 L3 8 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}

/** Base — bold B in a circle (Coinbase aesthetic) */
function BaseIcon({ size = 14, className }: ChainIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M6 4.5 L6 11.5 M6 4.5 L9.5 4.5 Q11.5 4.5 11.5 6.5 Q11.5 8 9.5 8 L6 8 M6 8 L9.5 8 Q11.5 8 11.5 10 Q11.5 11.5 9.5 11.5 L6 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

/** Arbitrum — stylised A with slant */
function ArbitrumIcon({ size = 14, className }: ChainIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2.5 L13.5 13 L2.5 13 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.5" />
      <path d="M8 5.5 L11 13 L5 13 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <line x1="5.5" y1="10" x2="10.5" y2="10" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

/** Optimism — circle with inner ring (O) */
function OptimismIcon({ size = 14, className }: ChainIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.2" opacity="0.85" fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}

/** Polygon — angular P / polygon shape */
function PolygonIcon({ size = 14, className }: ChainIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      {/* Two overlapping parallelograms — Polygon's mark simplified */}
      <path d="M10 3.5 L13.5 5.5 L13.5 10 L10 12 L6.5 10 L6.5 5.5 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.7" fill="currentColor" fillOpacity="0.08" />
      <path d="M6 4 L9.5 6 L9.5 10.5 L6 12.5 L2.5 10.5 L2.5 6 Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.45" />
    </svg>
  );
}

const CHAIN_ICONS: Record<number, React.FC<ChainIconProps>> = {
  0: AllChainsIcon,
  1: EthereumIcon,
  8453: BaseIcon,
  42161: ArbitrumIcon,
  10: OptimismIcon,
  137: PolygonIcon,
};

export { CHAIN_ICONS };
export type { ChainIconProps };
