import * as Clipboard from 'expo-clipboard';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  LogOut,
  Send,
  Wallet,
} from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { LineChart } from '@/components/Charts';
import { TokenAvatar } from '@/components/TokenAvatar';
import type { Activity, Holding, Token } from '@/types';
import {
  formatCurrency,
  shortAddress,
  timeAgo,
} from '@/utils/format';

function Action({
  label,
  Icon,
}: {
  label: string;
  Icon: typeof Send;
}) {
  return (
    <Pressable className="flex-1 items-center">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-chad">
        <Icon size={24} color="#020817" strokeWidth={2.4} />
      </View>
      <Text className="mt-2 text-xs font-bold text-ink">{label}</Text>
    </Pressable>
  );
}

export function PortfolioScreen({
  walletAddress,
  holdings,
  activities,
  onTokenPress,
  onLogout,
}: {
  walletAddress: string;
  holdings: Holding[];
  activities: Activity[];
  onTokenPress: (token: Token) => void;
  onLogout?: () => void;
}) {
  const holdingsValue = holdings.reduce(
    (total, item) => total + item.quantity * item.token.priceUsd,
    0,
  );
  const invested = holdings.reduce(
    (total, item) => total + item.quantity * item.averagePrice,
    0,
  );
  const pnl = holdingsValue - invested;
  const chart = activities.length
    ? [...activities]
        .reverse()
        .reduce<number[]>((values, activity) => {
          const previous = values.at(-1) ?? Math.max(0, holdingsValue - pnl);
          const change =
            activity.type === 'buy' ? activity.amountUsd : -activity.amountUsd;
          values.push(Math.max(0, previous + change));
          return values;
        }, [Math.max(0, holdingsValue - pnl)])
    : [0, 0, 0, 0, holdingsValue];

  async function copyAddress() {
    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('Wallet copied', shortAddress(walletAddress, 6));
  }

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="px-4 pb-28"
    >
      <View className="mt-3 flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-bold text-muted">Your portfolio</Text>
          <Text className="mt-1 text-4xl font-black tracking-tight text-ink">
            {formatCurrency(holdingsValue)}
          </Text>
        </View>
        {onLogout ? (
          <Pressable
            onPress={onLogout}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-panel"
          >
            <LogOut size={20} color="#8C9AB2" />
          </Pressable>
        ) : null}
      </View>

      <View className="mt-2 flex-row items-center">
        <Text className={pnl >= 0 ? 'font-bold text-chad' : 'font-bold text-danger'}>
          {pnl >= 0 ? '+' : ''}
          {formatCurrency(pnl)}
        </Text>
        <Text className="ml-2 text-sm text-muted">all time</Text>
      </View>

      <Pressable
        onPress={copyAddress}
        className="mt-5 flex-row items-center self-start rounded-full bg-panelSoft px-4 py-2.5"
      >
        <Wallet size={16} color="#1FE888" />
        <Text className="mx-2 text-xs font-bold text-ink">
          {shortAddress(walletAddress, 6)}
        </Text>
        <Copy size={14} color="#8C9AB2" />
      </Pressable>

      <View className="mt-4 rounded-3xl border border-line bg-[#030A18] pt-2">
        <LineChart values={chart} height={210} />
        <View className="mb-4 flex-row justify-around">
          {['1D', '1W', '1M', '3M', '1Y'].map((period, index) => (
            <View
              key={period}
              className={`rounded-lg px-3 py-1.5 ${
                index === 4 ? 'bg-chad' : ''
              }`}
            >
              <Text
                className={`text-xs font-black ${
                  index === 4 ? 'text-canvas' : 'text-muted'
                }`}
              >
                {period}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-6 flex-row">
        <Action label="Send" Icon={ArrowUp} />
        <Action label="Receive" Icon={ArrowDown} />
        <Action label="Deposit" Icon={Wallet} />
        <Action label="Withdraw" Icon={Send} />
      </View>

      <View className="mb-3 mt-8 flex-row items-end justify-between">
        <Text className="text-2xl font-black text-ink">Holdings</Text>
        <Text className="text-xs text-muted">{holdings.length} assets</Text>
      </View>

      {holdings.length ? (
        holdings.map((holding) => {
          const value = holding.quantity * holding.token.priceUsd;
          const itemPnl =
            value - holding.quantity * Math.max(holding.averagePrice, 0);
          return (
            <Pressable
              key={holding.token.address}
              onPress={() => onTokenPress(holding.token)}
              className="mb-2 flex-row items-center rounded-2xl border border-line bg-panel px-4 py-3"
            >
              <TokenAvatar
                symbol={holding.token.symbol}
                image={holding.token.image}
                size={45}
              />
              <View className="ml-3 flex-1">
                <Text className="font-bold text-ink">
                  {holding.token.symbol}
                </Text>
                <Text className="mt-0.5 text-xs text-muted">
                  {holding.quantity.toLocaleString('en-US', {
                    maximumFractionDigits: 4,
                  })}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-ink">
                  {formatCurrency(value)}
                </Text>
                <Text
                  className={`mt-0.5 text-xs font-bold ${
                    itemPnl >= 0 ? 'text-chad' : 'text-danger'
                  }`}
                >
                  {itemPnl >= 0 ? '+' : ''}
                  {formatCurrency(itemPnl)}
                </Text>
              </View>
            </Pressable>
          );
        })
      ) : (
        <View className="items-center rounded-3xl border border-dashed border-line bg-panel/50 px-6 py-10">
          <Wallet size={30} color="#526078" />
          <Text className="mt-3 text-base font-bold text-ink">
            No positions yet
          </Text>
          <Text className="mt-1 text-center text-sm text-muted">
            Buy a token from Trending to exercise the full portfolio flow.
          </Text>
        </View>
      )}

      <View className="mb-3 mt-8 flex-row items-end justify-between">
        <Text className="text-2xl font-black text-ink">Activity</Text>
        <Text className="text-xs text-muted">Local preview ledger</Text>
      </View>
      {activities.length ? (
        activities.map((activity) => (
          <View
            key={activity.id}
            className="mb-2 flex-row items-center rounded-2xl border border-line bg-panel px-4 py-3"
          >
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                activity.type === 'buy' ? 'bg-[#123828]' : 'bg-[#3A1C22]'
              }`}
            >
              {activity.type === 'buy' ? (
                <ArrowDown size={19} color="#1FE888" />
              ) : (
                <ArrowUp size={19} color="#FF4D47" />
              )}
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold capitalize text-ink">
                {activity.type} {activity.symbol}
              </Text>
              <Text className="mt-0.5 text-xs text-muted">
                {timeAgo(activity.timestamp)} · {activity.status}
              </Text>
            </View>
            <Text className="font-bold text-ink">
              {formatCurrency(activity.amountUsd)}
            </Text>
          </View>
        ))
      ) : (
        <Text className="py-4 text-sm text-muted">No activity yet.</Text>
      )}
    </ScrollView>
  );
}
