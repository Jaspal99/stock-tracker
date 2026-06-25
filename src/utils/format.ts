export function formatCurrency(value: number, compact = false) {
  if (!Number.isFinite(value)) return '$0.00';

  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: value < 1_000 ? 2 : 1,
    }).format(value);
  }

  const maximumFractionDigits = value > 1 ? 2 : value > 0.01 ? 4 : 8;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
  }).format(value);
}

export function formatCompact(value: number) {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0.00%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function shortAddress(address: string, size = 4) {
  if (!address) return 'Wallet unavailable';
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}

export function timeAgo(timestamp: number) {
  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function tokenColor(symbol: string) {
  const palette = ['#1FE888', '#2B9AF3', '#A78BFA', '#F59E0B', '#FB7185'];
  const sum = symbol
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[sum % palette.length];
}
