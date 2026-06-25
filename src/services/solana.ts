import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

import { config } from '@/config';

export async function fetchSolBalance(address: string) {
  if (!address) return 0;
  const connection = new Connection(config.rpcUrl, 'confirmed');
  const lamports = await connection.getBalance(new PublicKey(address));
  return lamports / LAMPORTS_PER_SOL;
}

export async function fetchJupiterQuote({
  inputMint,
  outputMint,
  amount,
}: {
  inputMint: string;
  outputMint: string;
  amount: string;
}) {
  if (!config.jupiterApiKey) {
    throw new Error('Add EXPO_PUBLIC_JUPITER_API_KEY to request live quotes.');
  }

  const query = new URLSearchParams({
    inputMint,
    outputMint,
    amount,
    taker: '11111111111111111111111111111111',
  });

  const response = await fetch(`https://api.jup.ag/swap/v2/order?${query}`, {
    headers: { 'x-api-key': config.jupiterApiKey },
  });

  if (!response.ok) {
    throw new Error(`Jupiter quote failed (${response.status})`);
  }

  return response.json();
}
