import { useEffect, useMemo, useRef, useState } from 'react';
import type { Candle, CustomTimeFrame } from '../../../types/chart';
import {
  createRandom,
  generateMockCandles,
  generateNewCandle,
  generateNextTick,
} from '../utils/generateMockCandles';
import { timeframeToSeconds } from '../utils/timeframe';
import { MOCK_INSTRUMENTS } from '../../../mocks/instruments';

interface UseChartDataOptions {
  instrumentId: string;
  timeframe: CustomTimeFrame;
  candleCount?: number;
  streaming?: boolean;
}

export interface UseChartDataResult {
  candles: Candle[];
  lastTick: Candle | null;
  setStreaming: (s: boolean) => void;
}

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

export function useChartData(opts: UseChartDataOptions): UseChartDataResult {
  const { instrumentId, timeframe, candleCount = 500 } = opts;
  const instrument = useMemo(
    () =>
      MOCK_INSTRUMENTS.find((i) => i.id === instrumentId) ??
      MOCK_INSTRUMENTS[0],
    [instrumentId],
  );
  const volatility = useMemo(
    () => Math.max(0.05, instrument.basePrice * 0.005),
    [instrument],
  );
  const seed = useMemo(
    () =>
      hash(instrumentId) ^
      hash(`${timeframe.size}-${timeframe.unit}`),
    [instrumentId, timeframe.size, timeframe.unit],
  );

  const [candles, setCandles] = useState<Candle[]>(() =>
    generateMockCandles({
      basePrice: instrument.basePrice,
      volatility,
      count: candleCount,
      timeframe,
      seed,
    }),
  );
  const [lastTick, setLastTick] = useState<Candle | null>(null);
  const [streaming, setStreaming] = useState<boolean>(opts.streaming ?? true);
  const randRef = useRef<() => number>(createRandom(seed ^ 0xa5a5));
  const candlesRef = useRef<Candle[]>(candles);

  useEffect(() => {
    const next = generateMockCandles({
      basePrice: instrument.basePrice,
      volatility,
      count: candleCount,
      timeframe,
      seed,
    });
    setCandles(next);
    candlesRef.current = next;
    setLastTick(null);
    randRef.current = createRandom(seed ^ 0xa5a5);
  }, [instrument.basePrice, volatility, candleCount, timeframe, seed]);

  useEffect(() => {
    if (!streaming) {
      return undefined;
    }
    const stepSec = timeframeToSeconds(timeframe);
    const id = window.setInterval(() => {
      const arr = candlesRef.current;
      if (arr.length === 0) {
        return;
      }
      const last = arr[arr.length - 1];
      const now = Math.floor(Date.now() / 1000);
      const aligned = now - (now % stepSec);
      if (aligned > (last.time as number)) {
        const fresh = generateNewCandle(last, stepSec, volatility, randRef.current);
        const nextArr = arr.concat(fresh);
        candlesRef.current = nextArr;
        setCandles(nextArr);
        setLastTick(fresh);
      } else {
        const updated = generateNextTick(last, volatility, randRef.current);
        const nextArr = arr.slice(0, -1).concat(updated);
        candlesRef.current = nextArr;
        setLastTick(updated);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [streaming, timeframe, volatility]);

  return { candles, lastTick, setStreaming };
}
