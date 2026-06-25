import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Share2,
  Star,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LineChart } from '@/components/Charts';
import { TokenAvatar } from '@/components/TokenAvatar';
import { fetchTokenChart, fetchTokenDetails } from '@/services/market';
import type { Token, TradeSide } from '@/types';
import {
  formatCompact,
  formatCurrency,
  formatPercent,
  shortAddress,
} from '@/utils/format';

const periods = ['1H', '1D', '1W', '1M'] as const;

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="mb-2 w-[48.5%] rounded-2xl border border-line bg-panel px-4 py-3">
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="mt-1 text-base font-bold text-ink">{value}</Text>
    </View>
  );
}

export function TokenDetailsScreen({
  initialToken,
  onBack,
  onTrade,
}: {
  initialToken: Token;
  onBack: () => void;
  onTrade: (token: Token, side: TradeSide) => void;
}) {
  const [token, setToken] = useState(initialToken);
  const [period, setPeriod] = useState<(typeof periods)[number]>('1D');
  const [chartValues, setChartValues] = useState<number[]>(
    initialToken.sparkline,
  );
  const [chartLoading, setChartLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    let mounted = true;
    setChartLoading(true);
    Promise.all([
      fetchTokenDetails(initialToken.address),
      fetchTokenChart(
        initialToken.address,
        period === '1M' ? 'day' : 'hour',
      ),
    ])
      .then(([details, points]) => {
        if (!mounted) return;
        if (details) setToken(details);
        if (points.length > 2) {
          const size =
            period === '1H' ? 12 : period === '1D' ? 24 : period === '1W' ? 48 : 72;
          setChartValues(points.slice(-size).map((point) => point.value));
        }
      })
      .catch(() => {
        if (mounted) setChartValues(initialToken.sparkline);
      })
      .finally(() => {
        if (mounted) setChartLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [initialToken, period]);

  const positive = token.priceChange24h >= 0;
  const totalTrades = token.buys24h + token.sells24h;
  const marketActivity = useMemo(
    () => [
      {
        id: '1',
        label: 'Buy activity',
        count: token.buys24h,
        value: token.volume24h * (token.buys24h / Math.max(totalTrades, 1)),
        positive: true,
      },
      {
        id: '2',
        label: 'Sell activity',
        count: token.sells24h,
        value: token.volume24h * (token.sells24h / Math.max(totalTrades, 1)),
        positive: false,
      },
      {
        id: '3',
        label: 'Liquidity depth',
        count: totalTrades,
        value: token.liquidity,
        positive: token.liquidity > token.volume24h * 0.1,
      },
    ],
    [token, totalTrades],
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-panel"
        >
          <ArrowLeft size={23} color="#F8FAFC" />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <TokenAvatar
            symbol={token.symbol}
            image={token.image}
            size={36}
          />
          <Text className="text-xl font-black text-ink">{token.symbol}</Text>
        </View>
        <View className="flex-row">
          <Pressable
            onPress={() => setFavorite((value) => !value)}
            className="h-11 w-11 items-center justify-center"
          >
            <Star
              size={22}
              color={favorite ? '#F59E0B' : '#8C9AB2'}
              fill={favorite ? '#F59E0B' : 'transparent'}
            />
          </Pressable>
          <Pressable className="h-11 w-9 items-center justify-center">
            <Share2 size={21} color="#8C9AB2" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-4 pb-32">
        <View className="mt-4">
          <Text className="text-base font-bold text-ink">{token.name}</Text>
          <Text className="mt-2 text-5xl font-black tracking-tight text-ink">
            {formatCurrency(token.marketCap, true)}
          </Text>
          <Text
            className={`mt-2 text-sm font-bold ${
              positive ? 'text-chad' : 'text-danger'
            }`}
          >
            {formatPercent(token.priceChange24h)} today ·{' '}
            <Text className="text-muted">{formatCurrency(token.priceUsd)}</Text>
          </Text>
        </View>

        <View className="mt-5 rounded-3xl border border-line bg-[#030A18] px-1 pt-3">
          {chartLoading ? (
            <View className="h-[230px] items-center justify-center">
              <ActivityIndicator color="#1FE888" />
            </View>
          ) : (
            <LineChart
              values={chartValues}
              height={230}
              color={positive ? '#1FE888' : '#FF4D47'}
            />
          )}
          <View className="mb-3 flex-row px-3">
            {periods.map((item) => (
              <Pressable
                key={item}
                onPress={() => setPeriod(item)}
                className={`flex-1 rounded-xl py-2 ${
                  period === item ? 'bg-chad' : ''
                }`}
              >
                <Text
                  className={`text-center text-xs font-black ${
                    period === item ? 'text-canvas' : 'text-muted'
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4 flex-row gap-2">
          <Pressable className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-panelSoft py-3">
            <Copy size={16} color="#A7B2C7" />
            <Text className="text-xs font-bold text-ink">
              {shortAddress(token.address)}
            </Text>
          </Pressable>
          <Pressable className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-panelSoft py-3">
            <ExternalLink size={16} color="#A7B2C7" />
            <Text className="text-xs font-bold text-ink">
              {token.dex || 'Explorer'}
            </Text>
          </Pressable>
        </View>

        <Text className="mb-3 mt-7 text-2xl font-black text-ink">Stats</Text>
        <View className="flex-row flex-wrap justify-between">
          <Stat label="Market cap" value={formatCurrency(token.marketCap, true)} />
          <Stat label="Liquidity" value={formatCurrency(token.liquidity, true)} />
          <Stat label="24h volume" value={formatCurrency(token.volume24h, true)} />
          <Stat label="24h trades" value={formatCompact(totalTrades)} />
        </View>

        <View className="mb-3 mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-black text-ink">Activity</Text>
          <Text className="text-xs font-bold text-chad">Last 24h</Text>
        </View>
        {marketActivity.map((item) => (
          <View
            key={item.id}
            className="mb-2 flex-row items-center rounded-2xl border border-line bg-panel px-4 py-4"
          >
            <View
              className={`h-3 w-3 rounded-full ${
                item.positive ? 'bg-chad' : 'bg-danger'
              }`}
            />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-ink">{item.label}</Text>
              <Text className="mt-0.5 text-xs text-muted">
                {formatCompact(item.count)} transactions
              </Text>
            </View>
            <Text
              className={`font-black ${
                item.positive ? 'text-chad' : 'text-danger'
              }`}
            >
              {formatCurrency(item.value, true)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-line bg-canvas px-4 pb-7 pt-3">
        <Pressable
          onPress={() => onTrade(token, 'sell')}
          className="flex-1 rounded-2xl bg-danger py-4"
        >
          <Text className="text-center text-base font-black text-canvas">
            Sell
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onTrade(token, 'buy')}
          className="flex-[1.4] rounded-2xl bg-chad py-4"
        >
          <Text className="text-center text-base font-black text-canvas">
            Buy
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
