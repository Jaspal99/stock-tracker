import { useCallback, useEffect, useState } from 'react';

import { fetchTrendingTokens } from '@/services/market';
import type { Token } from '@/types';

const CACHED_TOKENS: Token[] = [
  {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Wrapped SOL',
    priceUsd: 142.37,
    priceChange24h: 4.28,
    marketCap: 78300000000,
    liquidity: 891000000,
    volume24h: 3240000000,
    buys24h: 18642,
    sells24h: 17431,
    sparkline: [19, 22, 21, 26, 24, 31, 28, 34, 32, 39, 41, 46],
  },
  {
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6AWvpBoE8p7HHJpP',
    symbol: 'BONK',
    name: 'Bonk',
    priceUsd: 0.00001421,
    priceChange24h: 11.82,
    marketCap: 1100000000,
    liquidity: 17200000,
    volume24h: 98000000,
    buys24h: 22944,
    sells24h: 19112,
    sparkline: [15, 19, 17, 21, 25, 24, 31, 29, 36, 40, 38, 48],
  },
  {
    address: 'EKpQGSJtjMFqKZ9KQanSquarexR4kNhwmo3sxRzGRpP',
    symbol: 'WIF',
    name: 'dogwifhat',
    priceUsd: 0.64,
    priceChange24h: -3.14,
    marketCap: 641000000,
    liquidity: 12600000,
    volume24h: 76000000,
    buys24h: 10232,
    sells24h: 11891,
    sparkline: [42, 39, 43, 37, 35, 38, 31, 34, 28, 30, 24, 21],
  },
];

export function useMarket() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const next = await fetchTrendingTokens();
      setTokens(next);
      setUsingCachedData(false);
      setError(null);
    } catch (reason) {
      setTokens((current) => (current.length ? current : CACHED_TOKENS));
      setUsingCachedData(true);
      setError(
        reason instanceof Error ? reason.message : 'Could not refresh market data',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    tokens,
    loading,
    refreshing,
    usingCachedData,
    error,
    refresh: () => refresh(true),
  };
}
