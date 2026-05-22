import type {
  ChartType,
  LayoutKind,
  TimeFramePreset,
  TimeFrameUnit,
} from '../../../types/chart';
import type { IndicatorKind } from '../../../types/indicator';

export const TIMEFRAMES: TimeFramePreset[] = [
  { key: '1m', label: '1 Min', size: 1, unit: 'minutes' },
  { key: '2m', label: '2 Min', size: 2, unit: 'minutes' },
  { key: '3m', label: '3 Min', size: 3, unit: 'minutes' },
  { key: '5m', label: '5 Min', size: 5, unit: 'minutes' },
  { key: '10m', label: '10 Min', size: 10, unit: 'minutes' },
  { key: '15m', label: '15 Min', size: 15, unit: 'minutes' },
  { key: '30m', label: '30 Min', size: 30, unit: 'minutes' },
  { key: '1h', label: '1 Hour', size: 1, unit: 'hours' },
  { key: '4h', label: '4 Hours', size: 4, unit: 'hours' },
  { key: '6h', label: '6 Hours', size: 6, unit: 'hours' },
  { key: '1d', label: '1 Day', size: 1, unit: 'days' },
  { key: '1w', label: '1 Week', size: 1, unit: 'weeks' },
  { key: '1M', label: '1 Month', size: 1, unit: 'months' },
];

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'candlestick', label: 'Candles' },
  { value: 'hollow', label: 'Hollow Candles' },
  { value: 'bar', label: 'Bars' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'baseline', label: 'Baseline' },
];

export const LAYOUTS: { value: LayoutKind; label: string; count: number }[] = [
  { value: 'single', label: 'Single', count: 1 },
  { value: 'double-h', label: 'Double Horizontal', count: 2 },
  { value: 'double-v', label: 'Double Vertical', count: 2 },
  { value: 'triple', label: 'Triple', count: 3 },
  { value: 'quadruple', label: 'Quadruple', count: 4 },
];

export const CUSTOM_TF_UNITS: { value: TimeFrameUnit; label: string }[] = [
  { value: 'minutes', label: 'Mins' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
];

export const INDICATOR_KINDS: { value: IndicatorKind; label: string }[] = [
  { value: 'SMA', label: 'SMA' },
  { value: 'EMA', label: 'EMA' },
  { value: 'BB', label: 'Bollinger Bands' },
  { value: 'RSI', label: 'RSI' },
  { value: 'MACD', label: 'MACD' },
];

export const DRAWING_TOOLS: { value: 'trendline' | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'trendline', label: 'Trend Line' },
];
