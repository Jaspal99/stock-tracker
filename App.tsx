import './global.css';

import {
  PrivyProvider,
  useEmbeddedSolanaWallet,
  useLoginWithOAuth,
  usePrivy,
} from '@privy-io/expo';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { config, DEMO_WALLET, hasPrivyConfig } from '@/config';
import { MainApp } from '@/MainApp';
import { AuthScreen } from '@/screens/AuthScreen';

function LoadingScreen({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator color="#1FE888" size="large" />
      <Text className="mt-4 text-sm font-semibold text-muted">{label}</Text>
    </View>
  );
}

function PrivyExperience() {
  const { user, isReady, logout } = usePrivy();
  const { login, state } = useLoginWithOAuth();
  const wallet = useEmbeddedSolanaWallet();

  if (!isReady) {
    return <LoadingScreen label="Securing your wallet…" />;
  }

  if (!user) {
    return (
      <AuthScreen
        loading={state.status === 'loading'}
        previewMode={false}
        onPreview={() => undefined}
        onGoogle={() => {
          login({ provider: 'google', redirectUri: '/' }).catch(() => undefined);
        }}
        onApple={() => {
          login({ provider: 'apple', redirectUri: '/' }).catch(() => undefined);
        }}
      />
    );
  }

  const walletAddress =
    wallet.status === 'connected' && wallet.wallets[0]?.address
      ? wallet.wallets[0].address
      : DEMO_WALLET;

  return <MainApp walletAddress={walletAddress} onLogout={logout} />;
}

function ReviewerExperience() {
  const [authenticated, setAuthenticated] = useState(false);
  if (!authenticated) {
    return (
      <AuthScreen
        loading={false}
        previewMode
        onGoogle={() => setAuthenticated(true)}
        onApple={() => setAuthenticated(true)}
        onPreview={() => setAuthenticated(true)}
      />
    );
  }

  return (
    <MainApp
      walletAddress={DEMO_WALLET}
      onLogout={() => setAuthenticated(false)}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {hasPrivyConfig ? (
        <PrivyProvider
          appId={config.privyAppId}
          clientId={config.privyClientId}
          config={{
            embedded: {
              solana: { createOnLogin: 'users-without-wallets' },
            },
          }}
        >
          <PrivyExperience />
        </PrivyProvider>
      ) : (
        <ReviewerExperience />
      )}
    </SafeAreaProvider>
  );
}
