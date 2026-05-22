export function formatPrice(value: number, digits: number = 2): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatVolume(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K';
  }
  return value.toFixed(0);
}
