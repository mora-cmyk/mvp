import { useEffect, useState } from 'react';
import type {
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  SeriesType,
  Time,
} from 'lightweight-charts';
import type { Candle } from '../../../types/chart';

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  candle: Candle | null;
  time: number | null;
}

interface UseCrosshairTooltipOptions {
  chart: IChartApi | null;
  series: ISeriesApi<SeriesType> | null;
  candles: Candle[];
  enabled: boolean;
}

export function useCrosshairTooltip(
  opts: UseCrosshairTooltipOptions,
): TooltipState {
  const { chart, series, candles, enabled } = opts;
  const [state, setState] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    candle: null,
    time: null,
  });

  useEffect(() => {
    if (!chart || !series) {
      return undefined;
    }
    if (!enabled) {
      setState((s) => ({ ...s, visible: false }));
      return undefined;
    }
    const handler = (param: MouseEventParams<Time>): void => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        setState((s) => ({ ...s, visible: false }));
        return;
      }
      const t = param.time as number;
      const candle =
        candles.find((c) => (c.time as number) === t) ??
        candles[candles.length - 1] ??
        null;
      setState({
        visible: true,
        x: param.point.x,
        y: param.point.y,
        candle,
        time: t,
      });
    };
    chart.subscribeCrosshairMove(handler);
    return () => {
      chart.unsubscribeCrosshairMove(handler);
    };
  }, [chart, series, candles, enabled]);

  return state;
}
