import type { NormalizedVault } from '../store/appStore';
import { computeStabilityScore } from './stabilityScore';
import { supabase } from '@/integrations/supabase/client';

const COMPOSER_BASE_URL = 'https://li.quest';

/** Call the lifi-proxy edge function which adds the API key server-side */
async function proxyFetch(path: string, params?: URLSearchParams): Promise<Response> {
  const queryParams = new URLSearchParams(params);
  queryParams.set('path', path);

  const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lifi-proxy?${queryParams}`;

  const res = await fetch(fnUrl, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Accept': 'application/json',
    },
  });
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RawVault {
  address: string;
  chainId: number;
  name: string;
  network?: string;
  protocol?: string | { name: string; url?: string };
  protocolName?: string;
  analytics?: {
    apy?: { base?: number; total?: number; reward?: number };
    tvl?: { usd?: string | number };
  };
  // Legacy flat fields (mock data compat)
  apy?: number;
  tvlUsd?: number;
  tvl?: number;
  apyBreakdown?: Record<string, number>;
  underlyingTokens?: Array<{ address: string; symbol: string; name?: string; decimals: number }>;
  stabilityScore?: number;
  asset?: string;
  chain?: { name: string; id: number };
  token?: { symbol: string; name: string };
  tags?: string[];
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
  // Extract from nested analytics (live API) or flat fields (mock)
  const rawApy = raw.analytics?.apy?.total ?? raw.apy ?? 0;
  const rawTvl = raw.analytics?.tvl?.usd
    ? (typeof raw.analytics.tvl.usd === 'string' ? parseFloat(raw.analytics.tvl.usd) : raw.analytics.tvl.usd)
    : raw.tvlUsd ?? raw.tvl ?? 0;
  const protocolName = typeof raw.protocol === 'object' ? raw.protocol?.name : raw.protocolName ?? raw.protocol ?? 'Unknown';

  const apy = typeof rawApy === 'number' ? (rawApy > 1 ? rawApy : rawApy * 100) : 0;

  const stabilityScore = raw.stabilityScore ?? computeStabilityScore({
    tvlUsd: rawTvl,
    protocol: protocolName ?? '',
    apy,
  });

  return {
    id: `${raw.chainId}-${raw.address}`,
    address: raw.address,
    chainId: raw.chainId,
    chainName: raw.network ?? CHAIN_NAMES[raw.chainId] ?? `Chain ${raw.chainId}`,
    name: raw.name || 'Unknown Vault',
    protocol: protocolName ?? 'Unknown',
    apy,
    tvlUsd: rawTvl,
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

    const res = await proxyFetch('/v1/earn/vaults', params);
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
    const res = await proxyFetch(`/v1/earn/vaults/${chainId}/${address}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return normalizeVault(data);
  } catch {
    return MOCK_VAULTS.find(v => v.chainId === chainId && v.address === address) ?? null;
  }
}

export async function fetchChains(): Promise<ChainInfo[]> {
  try {
    const res = await proxyFetch('/v1/earn/chains');
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    const raw = Array.isArray(data) ? data : data.chains ?? [];
    return raw.map((c: { chainId?: number; id?: number; name: string; logoURI?: string }) => ({
      id: c.chainId ?? c.id ?? 0,
      name: c.name,
      logoURI: c.logoURI,
    }));
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
    const res = await proxyFetch('/v1/earn/protocols');
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
    const res = await proxyFetch(`/v1/earn/portfolio/${walletAddress}/positions`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.positions ?? [];
  } catch {
    return [];
  }
}

// Composer uses COMPOSER_BASE_URL defined at top

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

  const res = await fetch(`${COMPOSER_BASE_URL}/v1/quote?${query}`, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Composer quote failed: ${err}`);
  }
  return res.json();
}
