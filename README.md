# Chad Trader

A React Native / Expo Solana memecoin trading app inspired by the supplied ChadWallet references.

## Implemented

- Privy Google and Apple OAuth integration with automatic Solana embedded-wallet creation when credentials are configured.
- Reviewer mode when Privy credentials are absent, so the app is still fully navigable in Appetize.
- Live Solana trending data with Birdeye support and a public DexScreener fallback.
- Pull-to-refresh, search, sorting, token sparklines, meme movers, and smart-activity feed.
- Token details with current pricing, OHLCV chart, stats, market activity, and buy/sell entry points.
- Persistent paper trading, holdings, PnL, activity history, wallet copy button, and net-worth chart.
- Cloudflare Worker proxy for Birdeye, DexScreener, GeckoTerminal, and Jupiter.
- Supabase schema with row-level security for profiles and activities.
- Devnet-first RPC configuration. Jupiter execution remains disabled in reviewer mode so no transaction or payment can be sent accidentally.

## Run locally

```bash
cp .env.example .env
npm install
npx expo prebuild
npm run android
```

Privy uses native modules, so use an Expo development build rather than Expo Go when Privy credentials are enabled.

## Environment

Set these in `.env`:

- `EXPO_PUBLIC_PRIVY_APP_ID`
- `EXPO_PUBLIC_PRIVY_CLIENT_ID`
- `EXPO_PUBLIC_SOLANA_RPC_URL` (Alchemy devnet first)
- `EXPO_PUBLIC_SOLANA_CLUSTER=devnet`
- `EXPO_PUBLIC_API_BASE_URL` after deploying the Worker

Optional direct-development keys:

- `EXPO_PUBLIC_BIRDEYE_API_KEY`
- `EXPO_PUBLIC_JUPITER_API_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Cloudflare

```bash
cd cloudflare-worker
npm install
npx wrangler secret put BIRDEYE_API_KEY
npx wrangler secret put JUPITER_API_KEY
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npm run deploy
```

Copy the resulting Worker URL into `EXPO_PUBLIC_API_BASE_URL`.

The mobile app sends completed preview activities to the Worker, which writes
them to Supabase with the service-role key. The key never ships in the app.

## Appetize preview

Build an APK:

```bash
npx eas-cli build --platform android --profile preview
```

Upload the downloaded APK to Appetize and share its public app URL.

## Trading safety

The included buy/sell flow is explicitly simulated and persists locally. It exercises the complete UI and portfolio flow without broadcasting a transaction. Live Jupiter execution should only be enabled after a funded Privy devnet wallet, Alchemy RPC, signing flow, and transaction confirmation handling are tested. Jupiter liquidity is mainnet-oriented, so do not pretend a devnet quote is a real swap.
