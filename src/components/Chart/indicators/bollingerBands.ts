import type { Candle } from '../../../types/chart';
import type { LinePoint } from './sma';
import { computeSMA } from './sma';

export interface BollingerSeries {
  upper: LinePoint[];
  middle: LinePoint[];
  lower: LinePoint[];
}

export function computeBollingerBands(
  candles: Candle[],
  period: number,
  stdMult: number,
): BollingerSeries {
  const middle = computeSMA(candles, period);
  const upper: LinePoint[] = [];
  const lower: LinePoint[] = [];
  if (middle.length === 0) {
    return { upper, middle, lower };
  }
  const offset = candles.length - middle.length;
  for (let i = 0; i < middle.length; i += 1) {
    const ci = i + offset;
    let variance = 0;
    for (let j = ci - period + 1; j <= ci; j += 1) {
      const diff = candles[j].close - middle[i].value;
      variance += diff * diff;
    }
    const sd = Math.sqrt(variance / period);
    upper.push({ time: middle[i].time, value: middle[i].value + sd * stdMult });
    lower.push({ time: middle[i].time, value: middle[i].value - sd * stdMult });
  }
  return { upper, middle, lower };
}
