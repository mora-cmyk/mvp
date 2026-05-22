import type { Candle } from '../../../types/chart';
import type { LinePoint } from './sma';

export function computeRSI(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0 || candles.length <= period) {
    return [];
  }
  const result: LinePoint[] = [];
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i += 1) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) {
      gain += diff;
    } else {
      loss += -diff;
    }
  }
  gain /= period;
  loss /= period;
  const firstRs = loss === 0 ? 100 : gain / loss;
  result.push({
    time: candles[period].time,
    value: 100 - 100 / (1 + firstRs),
  });
  for (let i = period + 1; i < candles.length; i += 1) {
    const diff = candles[i].close - candles[i - 1].close;
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    gain = (gain * (period - 1) + g) / period;
    loss = (loss * (period - 1) + l) / period;
    const rs = loss === 0 ? 100 : gain / loss;
    result.push({ time: candles[i].time, value: 100 - 100 / (1 + rs) });
  }
  return result;
}
