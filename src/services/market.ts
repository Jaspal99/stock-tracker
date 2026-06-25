import { config } from '@/config';
import type { ChartPoint, Token } from '@/types';

const DEFAULT_SPARKLINE = [18, 22, 20, 28, 24, 31, 29, 36, 34, 42, 39, 46];

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function makeSparkline(change: number, seed: number) {
  const direction = change >= 0 ? 1 : -1;
  return DEFAULT_SPARKLINE.map((value, index) => {
    const wobble = ((seed + index * 7) % 9) - 4;
    return Math.max(
      1,
      value +
        wobble +
        direction * index * Math.min(Math.abs(change), 40) * 0.08,
    );
  });
}

function normalizeDexPair(pair: any): Token {
  const change = number(pair.priceChange?.h24);
  const symbol = pair.baseToken?.symbol || 'TOKEN';
  return {
    address: pair.baseToken?.address || pair.pairAddress,
    symbol,
    name: pair.baseToken?.name || symbol,
    image: pair.info?.imageUrl,
    priceUsd: number(pair.priceUsd),
    priceChange24h: change,
    marketCap: number(pair.marketCap || pair.fdv),
    liquidity: number(pair.liquidity?.usd),
    volume24h: number(pair.volume?.h24),
    buys24h: number(pair.txns?.h24?.buys),
    sells24h: number(pair.txns?.h24?.sells),
    pairAddress: pair.pairAddress,
    dex: pair.dexId,
    sparkline: makeSparkline(change, symbol.charCodeAt(0) || 1),
  };
}

function normalizeBirdeye(item: any): Token {
  const change = number(
    item.price24hChangePercent ?? item.price_change_24h_percent,
  );
  const symbol = item.symbol || 'TOKEN';
  return {
    address: item.address,
    symbol,
    name: item.name || symbol,
    image: item.logoURI || item.logo_uri,
    priceUsd: number(item.price),
    priceChange24h: change,
    marketCap: number(item.marketcap ?? item.market_cap),
    liquidity: number(item.liquidity),
    volume24h: number(item.volume24hUSD ?? item.volume_24h_usd),
    buys24h: number(item.trade24h ?? item.trade_24h),
    sells24h: 0,
    sparkline: makeSparkline(change, symbol.charCodeAt(0) || 1),
  };
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Market request failed (${response.status})`);
  }

  return response.json();
}

async function fetchFromWorker(): Promise<Token[]> {
  const payload = await fetchJson(`${config.apiBaseUrl}/trending`);
  return payload.data as Token[];
}

async function fetchFromBirdeye(): Promise<Token[]> {
  const payload = await fetchJson(
    'https://public-api.birdeye.so/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=20',
    {
      headers: {
        'X-API-KEY': config.birdeyeApiKey,
        'x-chain': 'solana',
      },
    },
  );

  const items = payload?.data?.tokens ?? payload?.data?.items ?? [];
  return items
    .map(normalizeBirdeye)
    .filter((token: Token) => token.address);
}

async function fetchFromDexScreener(): Promise<Token[]> {
  const boosts = await fetchJson(
    'https://api.dexscreener.com/token-boosts/top/v1',
  );
  const addresses = boosts
    .filter((item: any) => item.chainId === 'solana')
    .map((item: any) => item.tokenAddress)
    .filter(Boolean)
    .slice(0, 24);

  if (!addresses.length) {
    throw new Error('No Solana trending tokens returned');
  }

  const pairs = await fetchJson(
    `https://api.dexscreener.com/tokens/v1/solana/${addresses.join(',')}`,
  );

  const bestPairByToken = new Map<string, any>();
  for (const pair of pairs) {
    const address = pair.baseToken?.address;
    if (!address) continue;
    const current = bestPairByToken.get(address);
    if (
      !current ||
      number(pair.liquidity?.usd) > number(current.liquidity?.usd)
    ) {
      bestPairByToken.set(address, pair);
    }
  }

  return addresses
    .map((address: string) => bestPairByToken.get(address))
    .filter(Boolean)
    .map(normalizeDexPair);
}

export async function fetchTrendingTokens(): Promise<Token[]> {
  if (config.apiBaseUrl) {
    try {
      return await fetchFromWorker();
    } catch {
      // Keep the preview usable if the worker is not deployed yet.
    }
  }

  if (config.birdeyeApiKey) {
    try {
      const tokens = await fetchFromBirdeye();
      if (tokens.length) return tokens;
    } catch {
      // Fall back to a public real-data provider.
    }
  }

  return fetchFromDexScreener();
}

export async function fetchTokenDetails(address: string): Promise<Token | null> {
  if (config.apiBaseUrl) {
    try {
      const payload = await fetchJson(`${config.apiBaseUrl}/token/${address}`);
      return payload.data as Token;
    } catch {
      // Continue with the direct fallback.
    }
  }

  const pairs = await fetchJson(
    `https://api.dexscreener.com/tokens/v1/solana/${address}`,
  );
  if (!pairs?.length) return null;
  const pair = [...pairs].sort(
    (a, b) => number(b.liquidity?.usd) - number(a.liquidity?.usd),
  )[0];
  return normalizeDexPair(pair);
}

export async function fetchTokenChart(
  address: string,
  timeframe: 'hour' | 'day' = 'hour',
): Promise<ChartPoint[]> {
  if (config.apiBaseUrl) {
    try {
      const payload = await fetchJson(
        `${config.apiBaseUrl}/ohlcv/${address}?timeframe=${timeframe}`,
      );
      return payload.data as ChartPoint[];
    } catch {
      // Continue with the direct fallback.
    }
  }

  const payload = await fetchJson(
    `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${address}/ohlcv/${timeframe}?aggregate=1&limit=72`,
  );
  const list = payload?.data?.attributes?.ohlcv_list ?? [];
  return list
    .map((row: number[]) => ({
      timestamp: row[0] * 1000,
      value: number(row[4]),
    }))
    .filter((point: ChartPoint) => point.value > 0)
    .reverse();
}
