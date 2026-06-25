import { Flame } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Sparkline } from '@/components/Charts';
import { TokenAvatar } from '@/components/TokenAvatar';
import type { Token } from '@/types';
import { formatCompact, formatPercent } from '@/utils/format';

export function MemesScreen({
  tokens,
  onTokenPress,
}: {
  tokens: Token[];
  onTokenPress: (token: Token) => void;
}) {
  const movers = [...tokens].sort(
    (a, b) => b.priceChange24h - a.priceChange24h,
  );

  return (
    <FlatList
      className="flex-1 bg-canvas"
      contentContainerClassName="px-4 pb-28"
      data={movers}
      keyExtractor={(item) => item.address}
      ListHeaderComponent={
        <View className="mb-5 mt-3">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#2B2312]">
            <Flame size={24} color="#F59E0B" />
          </View>
          <Text className="text-3xl font-black text-ink">Meme radar</Text>
          <Text className="mt-1 text-sm text-muted">
            Fastest-moving Solana tokens by 24h performance.
          </Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <Pressable
          onPress={() => onTokenPress(item)}
          className="mb-3 rounded-3xl border border-line bg-panel p-4"
        >
          <View className="flex-row items-center">
            <TokenAvatar
              symbol={item.symbol}
              image={item.image}
              size={50}
            />
            <View className="ml-3 flex-1">
              <Text className="text-lg font-black text-ink">
                {item.symbol}
              </Text>
              <Text numberOfLines={1} className="text-xs text-muted">
                #{index + 1} · {item.name}
              </Text>
            </View>
            <Text
              className={`text-base font-black ${
                item.priceChange24h >= 0 ? 'text-chad' : 'text-danger'
              }`}
            >
              {formatPercent(item.priceChange24h)}
            </Text>
          </View>
          <View className="mt-4 flex-row items-end justify-between">
            <View>
              <Text className="text-xs text-muted">24h volume</Text>
              <Text className="mt-1 text-xl font-black text-ink">
                ${formatCompact(item.volume24h)}
              </Text>
            </View>
            <Sparkline
              values={item.sparkline}
              positive={item.priceChange24h >= 0}
            />
          </View>
        </Pressable>
      )}
    />
  );
}
