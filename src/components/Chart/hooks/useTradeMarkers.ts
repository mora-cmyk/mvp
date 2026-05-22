import { useEffect, useMemo, useRef } from 'react';
import {
  createSeriesMarkers,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type SeriesMarker,
  type SeriesType,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle } from '../../../types/chart';
import type { TradeMarker } from '../../../types/order';
import type { TradeSpec } from '../../../mocks/trades';
import type { ThemePalette } from '../utils/themePresets';

interface UseTradeMarkersOptions {
  series: ISeriesApi<SeriesType> | null;
  candles: Candle[];
  tradeSpecs: TradeSpec[];
  palette: ThemePalette;
  visible: boolean;
}

export function useTradeMarkers(opts: UseTradeMarkersOptions): TradeMarker[] {
  const { series, candles, tradeSpecs, palette, visible } = opts;
  const pluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  const trades = useMemo<TradeMarker[]>(() => {
    if (candles.length === 0) {
      return [];
    }
    const lastIdx = candles.length - 1;
    return tradeSpecs
      .map((spec, idx) => {
        const ci = Math.max(0, lastIdx - spec.offsetFromLast);
        const c = candles[ci];
        if (!c) {
          return null;
        }
        return {
          id: `trade-${idx}`,
          instrumentId: 'mock',
          time: c.time as number,
          price: spec.side === 'buy' ? c.low : c.high,
          side: spec.side,
          quantity: spec.quantity,
        };
      })
      .filter((t): t is TradeMarker => t !== null);
  }, [candles, tradeSpecs]);

  const lastSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);

  useEffect(() => {
    if (lastSeriesRef.current !== series) {
      if (pluginRef.current) {
        try {
          pluginRef.current.detach();
        } catch {
          // ignore
        }
        pluginRef.current = null;
      }
      lastSeriesRef.current = series;
    }
    if (!series) {
      return;
    }
    if (!visible) {
      if (pluginRef.current) {
        pluginRef.current.setMarkers([]);
      }
      return;
    }
    const markers: SeriesMarker<Time>[] = trades.map((t) => ({
      time: t.time as UTCTimestamp,
      position: t.side === 'buy' ? 'belowBar' : 'aboveBar',
      color: t.side === 'buy' ? palette.orderBuy : palette.orderSell,
      shape: t.side === 'buy' ? 'arrowUp' : 'arrowDown',
      text: `${t.side === 'buy' ? 'B' : 'S'} ${t.quantity}`,
    }));
    if (!pluginRef.current) {
      pluginRef.current = createSeriesMarkers(series, markers);
    } else {
      pluginRef.current.setMarkers(markers);
    }
  }, [series, trades, palette, visible]);

  useEffect(() => {
    return () => {
      if (pluginRef.current) {
        try {
          pluginRef.current.detach();
        } catch {
          // ignore
        }
        pluginRef.current = null;
      }
    };
  }, []);

  return trades;
}
