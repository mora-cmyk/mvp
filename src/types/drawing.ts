import type { UTCTimestamp } from 'lightweight-charts';

export type DrawingKind = 'trendline';

export interface DrawingPoint {
  time: UTCTimestamp;
  price: number;
}

export interface TrendLineDrawing {
  id: string;
  kind: 'trendline';
  chartId: string;
  start: DrawingPoint;
  end: DrawingPoint;
  color: string;
  width: number;
}

export type DrawingShape = TrendLineDrawing;
