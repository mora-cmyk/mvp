import type { UTCTimestamp } from 'lightweight-charts';
import type { Candle, CustomTimeFrame } from '../../../types/chart';
import { timeframeToSeconds } from './timeframe';

export interface MockSeriesOptions {
  basePrice: number;
  volatility: number;
  count: number;
  timeframe: CustomTimeFrame;
  seed?: number;
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateMockCandles(opts: MockSeriesOptions): Candle[] {
  const rand = mulberry32(opts.seed ?? hashString(String(opts.basePrice)));
  const step = timeframeToSeconds(opts.timeframe);
  const now = Math.floor(Date.now() / 1000);
  const aligned = now - (now % step);
  const candles: Candle[] = [];
  let price = opts.basePrice;
  for (let i = opts.count - 1; i >= 0; i -= 1) {
    const time = (aligned - i * step) as UTCTimestamp;
    const drift = (rand() - 0.5) * opts.volatility * 2;
    const open = price;
    const close = Math.max(0.01, open + drift);
    const high = Math.max(open, close) + rand() * opts.volatility * 0.8;
    const low = Math.min(open, close) - rand() * opts.volatility * 0.8;
    const volume = Math.floor(500 + rand() * 5000);
    candles.push({ time, open, high, low: Math.max(0.01, low), close, volume });
    price = close;
  }
  return candles;
}

export function generateNextTick(
  last: Candle,
  volatility: number,
  rand: () => number,
): Candle {
  const drift = (rand() - 0.5) * volatility * 0.4;
  const close = Math.max(0.01, last.close + drift);
  const high = Math.max(last.high, close);
  const low = Math.min(last.low, close);
  const volumeDelta = Math.floor(rand() * 100);
  return {
    time: last.time,
    open: last.open,
    high,
    low,
    close,
    volume: last.volume + volumeDelta,
  };
}

export function generateNewCandle(
  prev: Candle,
  step: number,
  volatility: number,
  rand: () => number,
): Candle {
  const time = (prev.time + step) as UTCTimestamp;
  const open = prev.close;
  const close = Math.max(0.01, open + (rand() - 0.5) * volatility * 2);
  const high = Math.max(open, close) + rand() * volatility * 0.6;
  const low = Math.min(open, close) - rand() * volatility * 0.6;
  return {
    time,
    open,
    high,
    low: Math.max(0.01, low),
    close,
    volume: Math.floor(500 + rand() * 3000),
  };
}

export function createRandom(seed: number): () => number {
  return mulberry32(seed);
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
