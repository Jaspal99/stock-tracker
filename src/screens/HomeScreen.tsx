import { HelpCircle, Search, SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Sparkline } from '@/components/Charts';
import { TokenAvatar } from '@/components/TokenAvatar';
import type { Token } from '@/types';
import {
  formatCompact,
  formatCurrency,
  formatPercent,
} from '@/utils/format';

const filters = ['Trending', 'Top volume', 'New'];

export function HomeScreen({
  tokens,
  loading,
  refreshing,
  usingCachedData,
  onRefresh,
  onTokenPress,
}: {
  tokens: Token[];
  loading: boolean;
  refreshing: boolean;
  usingCachedData: boolean;
  onRefresh: () => void;
  onTokenPress: (token: Token) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Trending');

  const filtered = useMemo(() => {
    const searched = tokens.filter((token) =>
      `${token.symbol} ${token.name}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
    if (filter === 'Top volume') {
      return [...searched].sort((a, b) => b.volume24h - a.volume24h);
    }
    if (filter === 'New') {
      return [...searched].reverse();
    }
    return searched;
  }, [filter, query, tokens]);

  return (
    <View className="flex-1 bg-canvas">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.address}
        contentContainerClassName="px-4 pb-28"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1FE888"
            colors={['#1FE888']}
          />
        }
        ListHeaderComponent={
          <View>
            <View className="mb-5 mt-2 flex-row items-center gap-3">
              <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-panelSoft">
                <HelpCircle size={22} color="#A7B2C7" />
              </Pressable>
              <View className="h-12 flex-1 flex-row items-center rounded-2xl bg-panelSoft px-4">
                <Search size={20} color="#8C9AB2" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Tokens, wallets, #tweets"
                  placeholderTextColor="#738098"
                  className="ml-3 flex-1 text-[15px] text-ink"
                />
              </View>
              <Pressable className="h-12 w-12 items-center justify-center rounded-2xl bg-panelSoft">
                <SlidersHorizontal size={20} color="#A7B2C7" />
              </Pressable>
            </View>

            <View className="mb-5">
              <Text className="text-3xl font-black tracking-tight text-ink">
                Find the next runner
              </Text>
              <Text className="mt-1 text-sm text-muted">
                Live Solana markets · pull down to refresh
              </Text>
            </View>

            <View className="mb-4 flex-row gap-2">
              {filters.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  className={`rounded-full border px-4 py-2 ${
                    filter === item
                      ? 'border-chad bg-chad'
                      : 'border-line bg-panel'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      filter === item ? 'text-canvas' : 'text-muted'
                    }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {usingCachedData ? (
              <View className="mb-3 rounded-2xl border border-[#5B4518] bg-[#2B2312] px-4 py-3">
                <Text className="text-xs text-[#F5C96A]">
                  Showing the last bundled snapshot. Pull to retry live data.
                </Text>
              </View>
            ) : null}

            <View className="mb-2 flex-row items-center justify-between px-1">
              <Text className="text-sm font-bold text-ink">Trending now</Text>
              <Text className="text-xs text-muted">24h</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-24">
              <ActivityIndicator color="#1FE888" size="large" />
              <Text className="mt-3 text-sm text-muted">
                Scanning Solana markets…
              </Text>
            </View>
          ) : (
            <View className="items-center py-24">
              <Text className="text-muted">No matching tokens.</Text>
            </View>
          )
        }
        renderItem={({ item, index }) => {
          const positive = item.priceChange24h >= 0;
          return (
            <Pressable
              onPress={() => onTokenPress(item)}
              className="mb-2 flex-row items-center rounded-2xl border border-line bg-panel px-3 py-3 active:bg-panelSoft"
            >
              <Text className="mr-2 w-5 text-center text-xs font-bold text-muted">
                {index + 1}
              </Text>
              <TokenAvatar
                symbol={item.symbol}
                image={item.image}
                size={45}
              />
              <View className="ml-3 min-w-0 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-[15px] font-bold text-ink"
                >
                  {item.name}
                </Text>
                <Text className="mt-0.5 text-xs text-muted">
                  {item.symbol} · MC {formatCompact(item.marketCap)}
                </Text>
              </View>
              <Sparkline values={item.sparkline} positive={positive} />
              <View className="ml-2 items-end">
                <Text className="text-sm font-bold text-ink">
                  {formatCurrency(item.priceUsd)}
                </Text>
                <Text
                  className={`mt-1 text-xs font-bold ${
                    positive ? 'text-chad' : 'text-danger'
                  }`}
                >
                  {formatPercent(item.priceChange24h)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
