import { useEffect, useRef, useState } from 'react';
import {
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  PriceScaleMode,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle, ChartType, ScaleMode } from '../../../types/chart';
import type { ThemePalette } from '../utils/themePresets';

interface UsePriceSeriesOptions {
  chart: IChartApi | null;
  chartType: ChartType;
  candles: Candle[];
  lastTick: Candle | null;
  palette: ThemePalette;
  showVolume: boolean;
  scaleMode: ScaleMode;
}

export interface UsePriceSeriesResult {
  priceSeries: ISeriesApi<SeriesType> | null;
}

export function usePriceSeries(
  opts: UsePriceSeriesOptions,
): UsePriceSeriesResult {
  const {
    chart,
    chartType,
    candles,
    lastTick,
    palette,
    showVolume,
    scaleMode,
  } = opts;

  const priceSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const lastTypeRef = useRef<ChartType | null>(null);
  const lastChartRef = useRef<IChartApi | null>(null);
  const [, setVersion] = useState<number>(0);

  useEffect(() => {
    if (lastChartRef.current !== chart) {
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
      lastTypeRef.current = null;
      lastChartRef.current = chart;
    }
    if (!chart) {
      return;
    }
    if (priceSeriesRef.current && lastTypeRef.current === chartType) {
      return;
    }
    if (priceSeriesRef.current) {
      try {
        chart.removeSeries(priceSeriesRef.current);
      } catch {
        // ignore
      }
      priceSeriesRef.current = null;
    }
    priceSeriesRef.current = createSeriesByType(chart, chartType, palette);
    lastTypeRef.current = chartType;
    setVersion((n: number) => n + 1);
  }, [chart, chartType, palette]);

  useEffect(() => {
    if (!chart) {
      return;
    }
    if (showVolume && !volumeSeriesRef.current) {
      const v = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume_scale',
        color: palette.volumeUp,
      });
      v.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volumeSeriesRef.current = v;
    } else if (!showVolume && volumeSeriesRef.current) {
      try {
        chart.removeSeries(volumeSeriesRef.current);
      } catch {
        // ignore
      }
      volumeSeriesRef.current = null;
    }
  }, [chart, showVolume, palette]);

  useEffect(() => {
    const s = priceSeriesRef.current;
    if (!s || !chart) {
      return;
    }
    applySeriesData(s, chartType, candles, palette);
    const v = volumeSeriesRef.current;
    if (v) {
      v.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume,
          color:
            c.close >= c.open ? palette.volumeUp : palette.volumeDown,
        })),
      );
    }
  }, [chart, chartType, candles, palette]);

  useEffect(() => {
    if (!lastTick || !priceSeriesRef.current) {
      return;
    }
    updateSeriesPoint(
      priceSeriesRef.current,
      chartType,
      lastTick,
      palette,
    );
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.update({
        time: lastTick.time as UTCTimestamp,
        value: lastTick.volume,
        color:
          lastTick.close >= lastTick.open
            ? palette.volumeUp
            : palette.volumeDown,
      });
    }
  }, [lastTick, chartType, palette]);

  useEffect(() => {
    if (!chart) {
      return;
    }
    const mode =
      scaleMode === 'log'
        ? PriceScaleMode.Logarithmic
        : scaleMode === 'percent'
          ? PriceScaleMode.Percentage
          : PriceScaleMode.Normal;
    chart.priceScale('right').applyOptions({ mode });
  }, [chart, scaleMode]);

  return { priceSeries: priceSeriesRef.current };
}

function createSeriesByType(
  chart: IChartApi,
  type: ChartType,
  palette: ThemePalette,
): ISeriesApi<SeriesType> {
  switch (type) {
    case 'candlestick':
      return chart.addSeries(CandlestickSeries, {
        upColor: palette.upColor,
        downColor: palette.downColor,
        borderUpColor: palette.upColor,
        borderDownColor: palette.downColor,
        wickUpColor: palette.wickUp,
        wickDownColor: palette.wickDown,
      });
    case 'hollow':
      return chart.addSeries(CandlestickSeries, {
        upColor: palette.background,
        downColor: palette.downColor,
        borderUpColor: palette.upColor,
        borderDownColor: palette.downColor,
        wickUpColor: palette.wickUp,
        wickDownColor: palette.wickDown,
      });
    case 'bar':
      return chart.addSeries(BarSeries, {
        upColor: palette.upColor,
        downColor: palette.downColor,
      });
    case 'line':
      return chart.addSeries(LineSeries, {
        color: palette.accent,
        lineWidth: 2,
      });
    case 'area':
      return chart.addSeries(AreaSeries, {
        lineColor: palette.accent,
        topColor: palette.accent + '66',
        bottomColor: palette.accent + '00',
        lineWidth: 2,
      });
    case 'baseline':
      return chart.addSeries(BaselineSeries, {
        topLineColor: palette.upColor,
        topFillColor1: palette.upColor + '66',
        topFillColor2: palette.upColor + '11',
        bottomLineColor: palette.downColor,
        bottomFillColor1: palette.downColor + '11',
        bottomFillColor2: palette.downColor + '66',
        lineWidth: 2,
      });
  }
}

function applySeriesData(
  series: ISeriesApi<SeriesType>,
  type: ChartType,
  candles: Candle[],
  palette: ThemePalette,
): void {
  if (type === 'line' || type === 'area' || type === 'baseline') {
    const s = series as ISeriesApi<'Line' | 'Area' | 'Baseline'>;
    s.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.close,
      })),
    );
    return;
  }
  if (type === 'hollow') {
    const s = series as ISeriesApi<'Candlestick'>;
    s.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        color: c.close >= c.open ? 'rgba(0,0,0,0)' : palette.downColor,
      })),
    );
    return;
  }
  const s = series as ISeriesApi<'Candlestick' | 'Bar'>;
  s.setData(
    candles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })),
  );
}

function updateSeriesPoint(
  series: ISeriesApi<SeriesType>,
  type: ChartType,
  c: Candle,
  palette: ThemePalette,
): void {
  if (type === 'line' || type === 'area' || type === 'baseline') {
    const s = series as ISeriesApi<'Line' | 'Area' | 'Baseline'>;
    s.update({ time: c.time as UTCTimestamp, value: c.close });
    return;
  }
  if (type === 'hollow') {
    const s = series as ISeriesApi<'Candlestick'>;
    s.update({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      color: c.close >= c.open ? 'rgba(0,0,0,0)' : palette.downColor,
    });
    return;
  }
  const s = series as ISeriesApi<'Candlestick' | 'Bar'>;
  s.update({
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  });
}
