import * as Clipboard from 'expo-clipboard';
import { Wallet } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/BottomNav';
import { TradeSheet } from '@/components/TradeSheet';
import { useMarket } from '@/hooks/useMarket';
import { syncActivity } from '@/services/backend';
import { executePaperTrade, loadPortfolio } from '@/services/portfolio';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { MemesScreen } from '@/screens/MemesScreen';
import { PortfolioScreen } from '@/screens/PortfolioScreen';
import { TokenDetailsScreen } from '@/screens/TokenDetailsScreen';
import type {
  Activity,
  AppTab,
  Holding,
  Token,
  TradeSide,
} from '@/types';
import { shortAddress } from '@/utils/format';

export function MainApp({
  walletAddress,
  onLogout,
}: {
  walletAddress: string;
  onLogout?: () => void;
}) {
  const market = useMarket();
  const [tab, setTab] = useState<AppTab>('home');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tradeToken, setTradeToken] = useState<Token | null>(null);
  const [tradeSide, setTradeSide] = useState<TradeSide>('buy');
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadPortfolio()
      .then((portfolio) => {
        setHoldings(portfolio.holdings);
        setActivities(portfolio.activities);
      })
      .catch(() => {
        // A fresh install simply starts with an empty portfolio.
      });
  }, []);

  function openTrade(token: Token, side: TradeSide) {
    setTradeToken(token);
    setTradeSide(side);
  }

  async function submitTrade(side: TradeSide, amount: number) {
    if (!tradeToken) return;
    try {
      const result = await executePaperTrade({
        token: tradeToken,
        side,
        amountUsd: amount,
        holdings,
        activities,
      });
      setHoldings(result.holdings);
      setActivities(result.activities);
      syncActivity(walletAddress, result.activity).catch(() => {
        // Local persistence is the source of truth if the backend is offline.
      });
      Alert.alert(
        side === 'buy' ? 'Position opened' : 'Position reduced',
        `${result.activity.symbol} · $${result.activity.amountUsd.toFixed(2)} simulated`,
      );
    } catch (reason) {
      Alert.alert(
        'Trade not completed',
        reason instanceof Error ? reason.message : 'Please try again.',
      );
      throw reason;
    }
  }

  async function copyWallet() {
    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('Wallet copied', walletAddress);
  }

  if (selectedToken) {
    return (
      <>
        <TokenDetailsScreen
          initialToken={selectedToken}
          onBack={() => setSelectedToken(null)}
          onTrade={openTrade}
        />
        <TradeSheet
          visible={Boolean(tradeToken)}
          token={tradeToken}
          initialSide={tradeSide}
          onClose={() => setTradeToken(null)}
          onSubmit={submitTrade}
        />
      </>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-canvas">
      <View className="flex-1">
        {tab === 'home' ? (
          <HomeScreen
            tokens={market.tokens}
            loading={market.loading}
            refreshing={market.refreshing}
            usingCachedData={market.usingCachedData}
            onRefresh={market.refresh}
            onTokenPress={setSelectedToken}
          />
        ) : null}
        {tab === 'memes' ? (
          <MemesScreen
            tokens={market.tokens}
            onTokenPress={setSelectedToken}
          />
        ) : null}
        {tab === 'discover' ? (
          <DiscoverScreen
            tokens={market.tokens}
            onTokenPress={setSelectedToken}
          />
        ) : null}
        {tab === 'portfolio' ? (
          <PortfolioScreen
            walletAddress={walletAddress}
            holdings={holdings}
            activities={activities}
            onTokenPress={setSelectedToken}
            onLogout={onLogout}
          />
        ) : null}

        {tab !== 'portfolio' ? (
          <Pressable
            onPress={copyWallet}
            className="absolute bottom-2 self-center flex-row items-center rounded-full border border-line bg-panelSoft px-4 py-2 shadow-lg"
          >
            <Wallet size={15} color="#1FE888" />
            <Text className="ml-2 text-xs font-bold text-ink">
              {shortAddress(walletAddress, 5)}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <BottomNav active={tab} onChange={setTab} />

      <TradeSheet
        visible={Boolean(tradeToken)}
        token={tradeToken}
        initialSide={tradeSide}
        onClose={() => setTradeToken(null)}
        onSubmit={submitTrade}
      />
    </SafeAreaView>
  );
}
