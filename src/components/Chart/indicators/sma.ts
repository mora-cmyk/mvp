import type { UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '../../../types/chart';

export interface LinePoint {
  time: UTCTimestamp;
  value: number;
}

export function computeSMA(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0 || candles.length < period) {
    return [];
  }
  const result: LinePoint[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i += 1) {
    sum += candles[i].close;
    if (i >= period) {
      sum -= candles[i - period].close;
    }
    if (i >= period - 1) {
      result.push({ time: candles[i].time, value: sum / period });
    }
  }
  return result;
}
