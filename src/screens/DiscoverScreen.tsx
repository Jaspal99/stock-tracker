import { Activity, Bot, CircleDollarSign } from 'lucide-react-native';
import { FlatList, Pressable, Text, View } from 'react-native';

import { TokenAvatar } from '@/components/TokenAvatar';
import type { Token } from '@/types';
import { formatCurrency } from '@/utils/format';

export function DiscoverScreen({
  tokens,
  onTokenPress,
}: {
  tokens: Token[];
  onTokenPress: (token: Token) => void;
}) {
  const feed = tokens.slice(0, 14).map((token, index) => ({
    id: `${token.address}-${index}`,
    token,
    trader: ['roman.sol', 'cupsey', 'alpha-vault', 'smart-money-7'][index % 4],
    side: index % 3 === 0 ? 'sold' : 'bought',
    amount: Math.max(42, token.volume24h / Math.max(token.buys24h + token.sells24h, 1)),
    time: `${index + 1}m`,
  }));

  return (
    <FlatList
      className="flex-1 bg-canvas"
      contentContainerClassName="px-4 pb-28"
      data={feed}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View className="mb-5 mt-3">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-black text-ink">Smart feed</Text>
              <Text className="mt-1 text-sm text-muted">
                Market activity distilled into useful signals.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-panelSoft">
              <Bot size={24} color="#1FE888" />
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 rounded-2xl border border-line bg-panel p-3">
              <Activity size={18} color="#1FE888" />
              <Text className="mt-2 text-xl font-black text-ink">Live</Text>
              <Text className="text-xs text-muted">Solana activity</Text>
            </View>
            <View className="flex-1 rounded-2xl border border-line bg-panel p-3">
              <CircleDollarSign size={18} color="#2B9AF3" />
              <Text className="mt-2 text-xl font-black text-ink">
                {tokens.length}
              </Text>
              <Text className="text-xs text-muted">Tokens tracked</Text>
            </View>
          </View>
          <Text className="mb-2 mt-6 text-sm font-bold text-ink">
            Recent moves
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View className="mb-4">
          <View className="mb-2 flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-panelSoft">
              <Text className="text-xs font-black text-ink">
                {item.trader.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <Text className="ml-3 flex-1 text-sm text-ink">
              <Text className="font-bold">{item.trader}</Text>{' '}
              <Text
                className={
                  item.side === 'bought' ? 'text-chad' : 'text-danger'
                }
              >
                {item.side}
              </Text>{' '}
              {formatCurrency(item.amount)}
            </Text>
            <Text className="text-xs text-muted">{item.time}</Text>
          </View>
          <Pressable
            onPress={() => onTokenPress(item.token)}
            className="ml-12 flex-row items-center rounded-2xl border border-line bg-panel p-3"
          >
            <TokenAvatar
              symbol={item.token.symbol}
              image={item.token.image}
              size={42}
            />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-ink">{item.token.name}</Text>
              <Text className="text-xs text-muted">
                {item.token.symbol} · {item.token.dex || 'Solana DEX'}
              </Text>
            </View>
            <Text className="font-bold text-ink">
              {formatCurrency(item.token.priceUsd)}
            </Text>
          </Pressable>
        </View>
      )}
    />
  );
}
