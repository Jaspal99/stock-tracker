export const config = {
  privyAppId: process.env.EXPO_PUBLIC_PRIVY_APP_ID ?? '',
  privyClientId: process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ?? '',
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, ''),
  birdeyeApiKey: process.env.EXPO_PUBLIC_BIRDEYE_API_KEY ?? '',
  jupiterApiKey: process.env.EXPO_PUBLIC_JUPITER_API_KEY ?? '',
  rpcUrl:
    process.env.EXPO_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com',
  cluster: process.env.EXPO_PUBLIC_SOLANA_CLUSTER ?? 'devnet',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export const hasPrivyConfig = Boolean(
  config.privyAppId && config.privyClientId,
);

export const DEMO_WALLET = '8XfL1eP6UkjvNQk3HsR5xV7AqM2dW9JcB4tYzKp6meme';
