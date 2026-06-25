export type Token = {
  address: string;
  symbol: string;
  name: string;
  image?: string;
  priceUsd: number;
  priceChange24h: number;
  marketCap: number;
  liquidity: number;
  volume24h: number;
  buys24h: number;
  sells24h: number;
  pairAddress?: string;
  dex?: string;
  sparkline: number[];
};

export type ChartPoint = {
  timestamp: number;
  value: number;
};

export type Holding = {
  token: Token;
  quantity: number;
  averagePrice: number;
};

export type Activity = {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  symbol: string;
  tokenAddress?: string;
  amountUsd: number;
  quantity?: number;
  priceUsd?: number;
  timestamp: number;
  status: 'confirmed' | 'simulated';
};

export type TradeSide = 'buy' | 'sell';
export type AppTab = 'home' | 'memes' | 'discover' | 'portfolio';
