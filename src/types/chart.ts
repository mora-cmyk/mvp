import type { UTCTimestamp } from 'lightweight-charts';

export type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type ChartType =
  | 'candlestick'
  | 'bar'
  | 'line'
  | 'area'
  | 'baseline'
  | 'hollow';

export type ThemeName = 'light' | 'dark' | 'grey';

export type ScaleMode = 'normal' | 'log' | 'percent';

export type TimeFrameUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export type TimeFrameKey =
  | '1m'
  | '2m'
  | '3m'
  | '5m'
  | '10m'
  | '15m'
  | '30m'
  | '1h'
  | '4h'
  | '6h'
  | '1d'
  | '1w'
  | '1M'
  | 'custom';

export interface TimeFramePreset {
  key: TimeFrameKey;
  label: string;
  size: number;
  unit: TimeFrameUnit;
}

export interface CustomTimeFrame {
  size: number;
  unit: TimeFrameUnit;
}

export type LayoutKind =
  | 'single'
  | 'double-h'
  | 'double-v'
  | 'triple'
  | 'quadruple';

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  basePrice: number;
}
