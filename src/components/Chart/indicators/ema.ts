import type { Candle } from '../../../types/chart';
import type { LinePoint } from './sma';

export function computeEMA(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0 || candles.length < period) {
    return [];
  }
  const k = 2 / (period + 1);
  const result: LinePoint[] = [];
  let prev = 0;
  for (let i = 0; i < period; i += 1) {
    prev += candles[i].close;
  }
  prev /= period;
  result.push({ time: candles[period - 1].time, value: prev });
  for (let i = period; i < candles.length; i += 1) {
    prev = candles[i].close * k + prev * (1 - k);
    result.push({ time: candles[i].time, value: prev });
  }
  return result;
}
