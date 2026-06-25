import { config } from '@/config';
import type { Activity } from '@/types';

export async function syncActivity(
  walletAddress: string,
  activity: Activity,
) {
  if (!config.apiBaseUrl) return;

  const response = await fetch(`${config.apiBaseUrl}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      activity,
      network: config.cluster,
    }),
  });

  if (!response.ok) {
    throw new Error(`Activity sync failed (${response.status})`);
  }
}
