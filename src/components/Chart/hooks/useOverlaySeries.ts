import { useEffect, useRef } from 'react';
import {
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { CustomTimeFrame } from '../../../types/chart';
import { MOCK_INSTRUMENTS } from '../../../mocks/instruments';
import { generateMockCandles } from '../utils/generateMockCandles';
import type { ThemePalette } from '../utils/themePresets';

interface UseOverlaySeriesOptions {
  chart: IChartApi | null;
  palette: ThemePalette;
  overlayInstrumentId: string | null;
  timeframe: CustomTimeFrame;
}

const OVERLAY_SCALE_ID = 'overlay_scale';

export function useOverlaySeries(opts: UseOverlaySeriesOptions): void {
  const { chart, palette, overlayInstrumentId, timeframe } = opts;
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chart) {
      return;
    }
    if (!overlayInstrumentId) {
      if (seriesRef.current) {
        try {
          chart.removeSeries(seriesRef.current);
        } catch {
          // ignore
        }
        seriesRef.current = null;
      }
      return;
    }
    const instrument =
      MOCK_INSTRUMENTS.find((i) => i.id === overlayInstrumentId) ??
      MOCK_INSTRUMENTS[0];
    const candles = generateMockCandles({
      basePrice: instrument.basePrice,
      volatility: Math.max(0.05, instrument.basePrice * 0.005),
      count: 500,
      timeframe,
      seed: hashStr(overlayInstrumentId),
    });
    if (seriesRef.current) {
      try {
        chart.removeSeries(seriesRef.current);
      } catch {
        // ignore
      }
      seriesRef.current = null;
    }
    const s = chart.addSeries(LineSeries, {
      color: palette.alert,
      lineWidth: 2,
      priceScaleId: OVERLAY_SCALE_ID,
    });
    s.priceScale().applyOptions({
      borderColor: palette.alert,
      scaleMargins: { top: 0.1, bottom: 0.1 },
    });
    s.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.close,
      })),
    );
    seriesRef.current = s;
  }, [chart, overlayInstrumentId, timeframe, palette]);

  useEffect(() => {
    return () => {
      const s = seriesRef.current;
      const c = opts.chart;
      if (s && c) {
        try {
          c.removeSeries(s);
        } catch {
          // ignore
        }
      }
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}
