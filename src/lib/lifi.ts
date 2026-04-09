import type { NormalizedVault } from '../store/appStore';
import { computeStabilityScore } from './stabilityScore';

const EARN_BASE = 'https://earn.li.fi';
const API_KEY = 'YOUR_API_KEY';

const headers = {
  'x-lifi-api-key': API_KEY,
  'Accept': 'application/json',
};

export interface RawVault {
  address: string;
  chainId: number;
  name: string;
  protocolName?: string;
  protocol?: string;
  apy: number;
  apyBreakdown?: Record<string, number>;
  tvlUsd?: number;
  tvl?: number;
  underlyingTokens?: Array<{ address: string; symbol: string; name: string; decimals: number }>;
  stabilityScore?: number;
  asset?: string;
  chain?: { name: string; id: number };
  token?: { symbol: string; name: string };
}

export interface ChainInfo {
  id: number;
  name: string;
  logoURI?: string;
}

export interface ProtocolInfo {
  name: string;
  logoURI?: string;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
  43114: 'Avalanche',
  56: 'BNB Chain',
  250: 'Fantom',
  100: 'Gnosis',
  324: 'zkSync',
  59144: 'Linea',
  534352: 'Scroll',
};

function normalizeVault(raw: RawVault): NormalizedVault {
  const stabilityScore = raw.stabilityScore ?? computeStabilityScore({
    tvlUsd: raw.tvlUsd ?? raw.tvl ?? 0,
    protocol: raw.protocolName ?? raw.protocol ?? '',
    apy: (raw.apy ?? 0) * 100,
  });

  return {
    id: `${raw.chainId}-${raw.address}`,
    address: raw.address,
    chainId: raw.chainId,
    chainName: CHAIN_NAMES[raw.chainId] ?? `Chain ${raw.chainId}`,
    name: raw.name || 'Unknown Vault',
    protocol: raw.protocolName ?? raw.protocol ?? 'Unknown',
    apy: typeof raw.apy === 'number' ? (raw.apy > 1 ? raw.apy : raw.apy * 100) : 0,
    tvlUsd: raw.tvlUsd ?? raw.tvl ?? 0,
    asset: raw.asset ?? raw.token?.symbol ?? raw.underlyingTokens?.[0]?.symbol ?? 'USDC',
    stabilityScore,
    apyBreakdown: raw.apyBreakdown,
  };
}

const MOCK_VAULTS: NormalizedVault[] = [
  { id: '8453-0x001', address: '0x001', chainId: 8453, chainName: 'Base', name: 'Morpho USDC Vault', protocol: 'morpho', apy: 8.45, tvlUsd: 245_000_000, asset: 'USDC', stabilityScore: 0.78 },
  { id: '42161-0x002', address: '0x002', chainId: 42161, chainName: 'Arbitrum', name: 'Aave V3 USDC Supply', protocol: 'aave-v3', apy: 5.21, tvlUsd: 890_000_000, asset: 'USDC', stabilityScore: 0.85 },
  { id: '1-0x003', address: '0x003', chainId: 1, chainName: 'Ethereum', name: 'Compound V3 USDC', protocol: 'compound-v3', apy: 4.82, tvlUsd: 1_200_000_000, asset: 'USDC', stabilityScore: 0.92 },
  { id: '10-0x004', address: '0x004', chainId: 10, chainName: 'Optimism', name: 'Euler USDC Lend', protocol: 'euler', apy: 7.15, tvlUsd: 156_000_000, asset: 'USDC', stabilityScore: 0.72 },
  { id: '137-0x005', address: '0x005', chainId: 137, chainName: 'Polygon', name: 'Aave V3 USDC (Polygon)', protocol: 'aave-v3', apy: 6.34, tvlUsd: 420_000_000, asset: 'USDC', stabilityScore: 0.80 },
  { id: '8453-0x006', address: '0x006', chainId: 8453, chainName: 'Base', name: 'Spark USDC Vault', protocol: 'spark', apy: 6.88, tvlUsd: 310_000_000, asset: 'USDC', stabilityScore: 0.76 },
  { id: '42161-0x007', address: '0x007', chainId: 42161, chainName: 'Arbitrum', name: 'Beefy USDC Compounder', protocol: 'beefy', apy: 12.45, tvlUsd: 89_000_000, asset: 'USDC', stabilityScore: 0.58 },
  { id: '1-0x008', address: '0x008', chainId: 1, chainName: 'Ethereum', name: 'Morpho Blue WETH', protocol: 'morpho', apy: 3.21, tvlUsd: 670_000_000, asset: 'WETH', stabilityScore: 0.82 },
  { id: '8453-0x009', address: '0x009', chainId: 8453, chainName: 'Base', name: 'Yearn USDC Vault', protocol: 'yearn', apy: 9.67, tvlUsd: 178_000_000, asset: 'USDC', stabilityScore: 0.70 },
  { id: '10-0x010', address: '0x010', chainId: 10, chainName: 'Optimism', name: 'Curve 3pool', protocol: 'curve', apy: 4.55, tvlUsd: 560_000_000, asset: 'USDC', stabilityScore: 0.81 },
  { id: '42161-0x011', address: '0x011', chainId: 42161, chainName: 'Arbitrum', name: 'DeFi Yield USDC', protocol: 'defi-yield', apy: 18.92, tvlUsd: 34_000_000, asset: 'USDC', stabilityScore: 0.42 },
  { id: '1-0x012', address: '0x012', chainId: 1, chainName: 'Ethereum', name: 'Lido stETH', protocol: 'lido', apy: 3.18, tvlUsd: 14_000_000_000, asset: 'stETH', stabilityScore: 0.95 },
];

export async function fetchVaults(chainId?: number): Promise<NormalizedVault[]> {
  try {
    const params = new URLSearchParams();
    if (chainId) params.set('chainId', String(chainId));
    params.set('sortBy', 'apy');
    params.set('limit', '50');

    const res = await fetch(`${EARN_BASE}/v1/earn/vaults?${params}`, { headers });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    const vaults = Array.isArray(data) ? data : data.vaults ?? data.data ?? [];
    if (vaults.length === 0) throw new Error('Empty response');
    return vaults.map(normalizeVault);
  } catch {
    console.warn('LI.FI API unavailable, using mock data');
    if (chainId) return MOCK_VAULTS.filter(v => v.chainId === chainId);
    return MOCK_VAULTS;
  }
}

export async function fetchVaultDetail(chainId: number, address: string): Promise<NormalizedVault | null> {
  try {
    const res = await fetch(`${EARN_BASE}/v1/earn/vaults/${chainId}/${address}`, { headers });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return normalizeVault(data);
  } catch {
    return MOCK_VAULTS.find(v => v.chainId === chainId && v.address === address) ?? null;
  }
}

export async function fetchChains(): Promise<ChainInfo[]> {
  try {
    const res = await fetch(`${EARN_BASE}/v1/earn/chains`, { headers });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.chains ?? [];
  } catch {
    return [
      { id: 1, name: 'Ethereum' },
      { id: 10, name: 'Optimism' },
      { id: 137, name: 'Polygon' },
      { id: 8453, name: 'Base' },
      { id: 42161, name: 'Arbitrum' },
    ];
  }
}

export async function fetchProtocols(): Promise<ProtocolInfo[]> {
  try {
    const res = await fetch(`${EARN_BASE}/v1/earn/protocols`, { headers });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.protocols ?? [];
  } catch {
    return [
      { name: 'aave-v3' }, { name: 'morpho' }, { name: 'compound-v3' },
      { name: 'euler' }, { name: 'spark' }, { name: 'lido' },
      { name: 'beefy' }, { name: 'yearn' }, { name: 'curve' },
    ];
  }
}

export async function fetchPortfolioPositions(walletAddress: string): Promise<unknown[]> {
  try {
    const res = await fetch(`${EARN_BASE}/v1/earn/portfolio/${walletAddress}/positions`, { headers });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.positions ?? [];
  } catch {
    return [];
  }
}

const COMPOSER_BASE = 'https://li.quest';

export interface ComposerQuote {
  transactionRequest: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    chainId: number;
  };
  estimate?: { toAmount: string; toAmountMin: string };
  action?: { fromToken: { symbol: string }; toToken: { symbol: string } };
}

export async function getComposerQuote(params: {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAddress: string;
  fromAmount: string;
}): Promise<ComposerQuote> {
  const query = new URLSearchParams({
    fromChain: String(params.fromChain),
    toChain: String(params.toChain),
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAddress: params.fromAddress,
    toAddress: params.fromAddress,
    fromAmount: params.fromAmount,
  });

  const res = await fetch(`${COMPOSER_BASE}/v1/quote?${query}`, { headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Composer quote failed: ${err}`);
  }
  return res.json();
}
