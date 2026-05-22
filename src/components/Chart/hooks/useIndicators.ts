import { useEffect, useRef } from 'react';
import {
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle } from '../../../types/chart';
import type {
  IndicatorInstance,
  IndicatorParams,
} from '../../../types/indicator';
import type { ThemePalette } from '../utils/themePresets';
import { computeSMA } from '../indicators/sma';
import { computeEMA } from '../indicators/ema';
import { computeBollingerBands } from '../indicators/bollingerBands';
import { computeRSI } from '../indicators/rsi';
import { computeMACD } from '../indicators/macd';

interface UseIndicatorsOptions {
  chart: IChartApi | null;
  candles: Candle[];
  indicators: IndicatorInstance[];
  palette: ThemePalette;
}

type IndicatorSeriesSet = ISeriesApi<'Line' | 'Histogram'>[];

interface IndicatorEntry {
  serial: string;
  series: IndicatorSeriesSet;
  paneIndex: number | null;
}

const PANE_PRICE = 0;

export function useIndicators(opts: UseIndicatorsOptions): void {
  const { chart, candles, indicators, palette } = opts;
  const entriesRef = useRef<Map<string, IndicatorEntry>>(new Map());

  useEffect(() => {
    if (!chart) {
      return;
    }
    const map = entriesRef.current;
    const desiredIds = new Set(indicators.map((i) => i.id));

    map.forEach((entry, id) => {
      if (!desiredIds.has(id)) {
        entry.series.forEach((s) => {
          try {
            chart.removeSeries(s);
          } catch {
            // ignore
          }
        });
        map.delete(id);
      }
    });

    let nextPane = computeNextPaneIndex(indicators);

    indicators.forEach((ind) => {
      const serial = serializeConfig(ind.config);
      const existing = map.get(ind.id);
      if (existing && existing.serial === serial) {
        updateIndicatorData(existing, ind, candles);
        return;
      }
      if (existing) {
        existing.series.forEach((s) => {
          try {
            chart.removeSeries(s);
          } catch {
            // ignore
          }
        });
        map.delete(ind.id);
      }
      const { entry, paneUsed } = createIndicator(
        chart,
        ind,
        candles,
        palette,
        nextPane,
      );
      if (paneUsed) {
        nextPane += 1;
      }
      entry.serial = serial;
      map.set(ind.id, entry);
    });
  }, [chart, indicators, candles, palette]);

  useEffect(() => {
    return () => {
      const map = entriesRef.current;
      const chart = opts.chart;
      if (chart) {
        map.forEach((entry) => {
          entry.series.forEach((s) => {
            try {
              chart.removeSeries(s);
            } catch {
              // ignore
            }
          });
        });
      }
      map.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function computeNextPaneIndex(indicators: IndicatorInstance[]): number {
  let n = 1;
  indicators.forEach((i) => {
    if (i.config.kind === 'RSI' || i.config.kind === 'MACD') {
      n += 1;
    }
  });
  return n - countPaneIndicators(indicators);
}

function countPaneIndicators(indicators: IndicatorInstance[]): number {
  return indicators.filter(
    (i) => i.config.kind === 'RSI' || i.config.kind === 'MACD',
  ).length;
}

function serializeConfig(c: IndicatorParams): string {
  return JSON.stringify(c);
}

function createIndicator(
  chart: IChartApi,
  ind: IndicatorInstance,
  candles: Candle[],
  palette: ThemePalette,
  paneIndex: number,
): { entry: IndicatorEntry; paneUsed: boolean } {
  const c = ind.config;
  if (c.kind === 'SMA') {
    const s = chart.addSeries(
      LineSeries,
      { color: c.params.color, lineWidth: 1 },
      PANE_PRICE,
    );
    s.setData(toLineData(computeSMA(candles, c.params.period)));
    return {
      entry: { serial: '', series: [s], paneIndex: null },
      paneUsed: false,
    };
  }
  if (c.kind === 'EMA') {
    const s = chart.addSeries(
      LineSeries,
      { color: c.params.color, lineWidth: 1 },
      PANE_PRICE,
    );
    s.setData(toLineData(computeEMA(candles, c.params.period)));
    return {
      entry: { serial: '', series: [s], paneIndex: null },
      paneUsed: false,
    };
  }
  if (c.kind === 'BB') {
    const bb = computeBollingerBands(candles, c.params.period, c.params.stdDev);
    const up = chart.addSeries(
      LineSeries,
      { color: c.params.color, lineWidth: 1 },
      PANE_PRICE,
    );
    const mid = chart.addSeries(
      LineSeries,
      { color: c.params.color, lineWidth: 1, lineStyle: 2 },
      PANE_PRICE,
    );
    const low = chart.addSeries(
      LineSeries,
      { color: c.params.color, lineWidth: 1 },
      PANE_PRICE,
    );
    up.setData(toLineData(bb.upper));
    mid.setData(toLineData(bb.middle));
    low.setData(toLineData(bb.lower));
    return {
      entry: { serial: '', series: [up, mid, low], paneIndex: null },
      paneUsed: false,
    };
  }
  if (c.kind === 'RSI') {
    const s = chart.addSeries(
      LineSeries,
      { color: c.params.color, lineWidth: 1, priceFormat: { type: 'price', precision: 2, minMove: 0.01 } },
      paneIndex,
    );
    s.setData(toLineData(computeRSI(candles, c.params.period)));
    const pane = chart.panes()[paneIndex];
    if (pane) {
      pane.setHeight(120);
    }
    return {
      entry: { serial: '', series: [s], paneIndex },
      paneUsed: true,
    };
  }
  if (c.kind === 'MACD') {
    const m = computeMACD(
      candles,
      c.params.fast,
      c.params.slow,
      c.params.signal,
    );
    const macd = chart.addSeries(
      LineSeries,
      { color: palette.accent, lineWidth: 1 },
      paneIndex,
    );
    const signal = chart.addSeries(
      LineSeries,
      { color: palette.alert, lineWidth: 1 },
      paneIndex,
    );
    const hist = chart.addSeries(
      HistogramSeries,
      { color: palette.upColor },
      paneIndex,
    );
    macd.setData(toLineData(m.macd));
    signal.setData(toLineData(m.signal));
    hist.setData(
      m.histogram.map((p) => ({
        time: p.time as UTCTimestamp,
        value: p.value,
        color: p.value >= 0 ? palette.upColor : palette.downColor,
      })),
    );
    const pane = chart.panes()[paneIndex];
    if (pane) {
      pane.setHeight(140);
    }
    return {
      entry: { serial: '', series: [macd, signal, hist], paneIndex },
      paneUsed: true,
    };
  }
  return {
    entry: { serial: '', series: [], paneIndex: null },
    paneUsed: false,
  };
}

function updateIndicatorData(
  entry: IndicatorEntry,
  ind: IndicatorInstance,
  candles: Candle[],
): void {
  const c = ind.config;
  if (c.kind === 'SMA') {
    (entry.series[0] as ISeriesApi<'Line'>).setData(
      toLineData(computeSMA(candles, c.params.period)),
    );
    return;
  }
  if (c.kind === 'EMA') {
    (entry.series[0] as ISeriesApi<'Line'>).setData(
      toLineData(computeEMA(candles, c.params.period)),
    );
    return;
  }
  if (c.kind === 'BB') {
    const bb = computeBollingerBands(candles, c.params.period, c.params.stdDev);
    (entry.series[0] as ISeriesApi<'Line'>).setData(toLineData(bb.upper));
    (entry.series[1] as ISeriesApi<'Line'>).setData(toLineData(bb.middle));
    (entry.series[2] as ISeriesApi<'Line'>).setData(toLineData(bb.lower));
    return;
  }
  if (c.kind === 'RSI') {
    (entry.series[0] as ISeriesApi<'Line'>).setData(
      toLineData(computeRSI(candles, c.params.period)),
    );
    return;
  }
  if (c.kind === 'MACD') {
    const m = computeMACD(
      candles,
      c.params.fast,
      c.params.slow,
      c.params.signal,
    );
    (entry.series[0] as ISeriesApi<'Line'>).setData(toLineData(m.macd));
    (entry.series[1] as ISeriesApi<'Line'>).setData(toLineData(m.signal));
    (entry.series[2] as ISeriesApi<'Histogram'>).setData(
      m.histogram.map((p) => ({
        time: p.time as UTCTimestamp,
        value: p.value,
      })),
    );
  }
}

function toLineData(
  points: { time: UTCTimestamp; value: number }[],
): { time: UTCTimestamp; value: number }[] {
  return points.map((p) => ({ time: p.time, value: p.value }));
}
