const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sparkline = (change, seed) =>
  [18, 22, 20, 28, 24, 31, 29, 36, 34, 42, 39, 46].map(
    (value, index) =>
      value +
      ((seed + index * 7) % 9) -
      4 +
      (change >= 0 ? 1 : -1) *
        index *
        Math.min(Math.abs(change), 40) *
        0.08,
  );

const normalizeDexPair = (pair) => {
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
    sparkline: sparkline(change, symbol.charCodeAt(0) || 1),
  };
};

async function getJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Upstream request failed (${response.status})`);
  }
  return response.json();
}

async function trendingFromBirdeye(apiKey) {
  const payload = await getJson(
    'https://public-api.birdeye.so/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=20',
    {
      headers: { 'X-API-KEY': apiKey, 'x-chain': 'solana' },
    },
  );
  const items = payload?.data?.tokens ?? payload?.data?.items ?? [];
  return items.map((item) => {
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
      sparkline: sparkline(change, symbol.charCodeAt(0) || 1),
    };
  });
}

async function trendingFromDexScreener() {
  const boosts = await getJson(
    'https://api.dexscreener.com/token-boosts/top/v1',
  );
  const addresses = boosts
    .filter((item) => item.chainId === 'solana')
    .map((item) => item.tokenAddress)
    .filter(Boolean)
    .slice(0, 24);
  const pairs = await getJson(
    `https://api.dexscreener.com/tokens/v1/solana/${addresses.join(',')}`,
  );
  const best = new Map();
  for (const pair of pairs) {
    const address = pair.baseToken?.address;
    if (
      address &&
      (!best.has(address) ||
        number(pair.liquidity?.usd) >
          number(best.get(address).liquidity?.usd))
    ) {
      best.set(address, pair);
    }
  }
  return addresses.map((address) => best.get(address)).filter(Boolean).map(normalizeDexPair);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === '/health') {
        return json({ ok: true, service: 'chad-trader-api' });
      }

      if (url.pathname === '/trending') {
        const data = env.BIRDEYE_API_KEY
          ? await trendingFromBirdeye(env.BIRDEYE_API_KEY)
          : await trendingFromDexScreener();
        return json({ data });
      }

      if (url.pathname.startsWith('/token/')) {
        const address = url.pathname.split('/').at(-1);
        const pairs = await getJson(
          `https://api.dexscreener.com/tokens/v1/solana/${address}`,
        );
        const pair = [...pairs].sort(
          (a, b) => number(b.liquidity?.usd) - number(a.liquidity?.usd),
        )[0];
        return pair ? json({ data: normalizeDexPair(pair) }) : json({ error: 'Not found' }, 404);
      }

      if (url.pathname.startsWith('/ohlcv/')) {
        const address = url.pathname.split('/').at(-1);
        const timeframe =
          url.searchParams.get('timeframe') === 'day' ? 'day' : 'hour';
        const payload = await getJson(
          `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${address}/ohlcv/${timeframe}?aggregate=1&limit=72`,
        );
        const data = (payload?.data?.attributes?.ohlcv_list ?? [])
          .map((row) => ({ timestamp: row[0] * 1000, value: number(row[4]) }))
          .filter((point) => point.value > 0)
          .reverse();
        return json({ data });
      }

      if (url.pathname === '/quote') {
        if (!env.JUPITER_API_KEY) {
          return json({ error: 'Jupiter API key is not configured' }, 503);
        }
        const upstream = new URL('https://api.jup.ag/swap/v2/order');
        url.searchParams.forEach((value, key) =>
          upstream.searchParams.set(key, value),
        );
        const payload = await getJson(upstream.toString(), {
          headers: { 'x-api-key': env.JUPITER_API_KEY },
        });
        return json({ data: payload });
      }

      if (url.pathname === '/activity' && request.method === 'POST') {
        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
          return json({ skipped: true, reason: 'Supabase is not configured' });
        }
        const body = await request.json();
        if (!body.walletAddress || !body.activity?.id) {
          return json({ error: 'Invalid activity payload' }, 400);
        }
        const response = await fetch(
          `${env.SUPABASE_URL}/rest/v1/wallet_activities`,
          {
            method: 'POST',
            headers: {
              apikey: env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              external_id: body.activity.id,
              wallet_address: body.walletAddress,
              activity_type: body.activity.type,
              token_address: body.activity.tokenAddress || null,
              token_symbol: body.activity.symbol,
              amount_usd: body.activity.amountUsd,
              quantity: body.activity.quantity || null,
              price_usd: body.activity.priceUsd || null,
              network: body.network || 'devnet',
              status: body.activity.status,
              created_at: new Date(body.activity.timestamp).toISOString(),
            }),
          },
        );
        if (!response.ok) {
          throw new Error(`Supabase write failed (${response.status})`);
        }
        return json({ ok: true }, 201);
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Unexpected API error',
        },
        502,
      );
    }
  },
};
