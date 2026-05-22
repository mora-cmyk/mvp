import type { Candle } from '../../../types/chart';
import type { LinePoint } from './sma';
import { computeEMA } from './ema';

export interface MacdSeries {
  macd: LinePoint[];
  signal: LinePoint[];
  histogram: LinePoint[];
}

export function computeMACD(
  candles: Candle[],
  fast: number,
  slow: number,
  signalPeriod: number,
): MacdSeries {
  const emaFast = computeEMA(candles, fast);
  const emaSlow = computeEMA(candles, slow);
  if (emaFast.length === 0 || emaSlow.length === 0) {
    return { macd: [], signal: [], histogram: [] };
  }
  const fastMap = new Map<number, number>();
  emaFast.forEach((p) => fastMap.set(p.time as number, p.value));
  const macd: LinePoint[] = [];
  emaSlow.forEach((p) => {
    const f = fastMap.get(p.time as number);
    if (f !== undefined) {
      macd.push({ time: p.time, value: f - p.value });
    }
  });
  if (macd.length < signalPeriod) {
    return { macd, signal: [], histogram: [] };
  }
  const signal: LinePoint[] = [];
  const k = 2 / (signalPeriod + 1);
  let prev = 0;
  for (let i = 0; i < signalPeriod; i += 1) {
    prev += macd[i].value;
  }
  prev /= signalPeriod;
  signal.push({ time: macd[signalPeriod - 1].time, value: prev });
  for (let i = signalPeriod; i < macd.length; i += 1) {
    prev = macd[i].value * k + prev * (1 - k);
    signal.push({ time: macd[i].time, value: prev });
  }
  const signalMap = new Map<number, number>();
  signal.forEach((p) => signalMap.set(p.time as number, p.value));
  const histogram: LinePoint[] = [];
  macd.forEach((p) => {
    const s = signalMap.get(p.time as number);
    if (s !== undefined) {
      histogram.push({ time: p.time, value: p.value - s });
    }
  });
  return { macd, signal, histogram };
}
