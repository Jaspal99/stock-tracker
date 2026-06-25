import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Activity, Holding, Token, TradeSide } from '@/types';

const HOLDINGS_KEY = '@chad-trader/holdings';
const ACTIVITY_KEY = '@chad-trader/activity';

export async function loadPortfolio() {
  const [holdingsRaw, activityRaw] = await Promise.all([
    AsyncStorage.getItem(HOLDINGS_KEY),
    AsyncStorage.getItem(ACTIVITY_KEY),
  ]);

  return {
    holdings: holdingsRaw ? (JSON.parse(holdingsRaw) as Holding[]) : [],
    activities: activityRaw ? (JSON.parse(activityRaw) as Activity[]) : [],
  };
}

export async function executePaperTrade({
  token,
  side,
  amountUsd,
  holdings,
  activities,
}: {
  token: Token;
  side: TradeSide;
  amountUsd: number;
  holdings: Holding[];
  activities: Activity[];
}) {
  const price = Math.max(token.priceUsd, 0.000000001);
  const requestedQuantity = amountUsd / price;
  const existing = holdings.find((item) => item.token.address === token.address);

  let nextHoldings = [...holdings];
  let executedQuantity = requestedQuantity;

  if (side === 'buy') {
    if (existing) {
      const totalCost =
        existing.quantity * existing.averagePrice + requestedQuantity * price;
      const quantity = existing.quantity + requestedQuantity;
      nextHoldings = holdings.map((item) =>
        item.token.address === token.address
          ? {
              ...item,
              token,
              quantity,
              averagePrice: totalCost / quantity,
            }
          : item,
      );
    } else {
      nextHoldings.push({
        token,
        quantity: requestedQuantity,
        averagePrice: price,
      });
    }
  } else {
    if (!existing?.quantity) {
      throw new Error(`You do not hold ${token.symbol} yet.`);
    }
    executedQuantity = Math.min(requestedQuantity, existing.quantity);
    nextHoldings = holdings
      .map((item) =>
        item.token.address === token.address
          ? { ...item, token, quantity: item.quantity - executedQuantity }
          : item,
      )
      .filter((item) => item.quantity > 0.00000001);
  }

  const activity: Activity = {
    id: `${Date.now()}-${token.address}`,
    type: side,
    symbol: token.symbol,
    tokenAddress: token.address,
    amountUsd: executedQuantity * price,
    quantity: executedQuantity,
    priceUsd: price,
    timestamp: Date.now(),
    status: 'simulated',
  };
  const nextActivities = [activity, ...activities].slice(0, 100);

  await Promise.all([
    AsyncStorage.setItem(HOLDINGS_KEY, JSON.stringify(nextHoldings)),
    AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(nextActivities)),
  ]);

  return { holdings: nextHoldings, activities: nextActivities, activity };
}
