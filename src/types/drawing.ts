import type { UTCTimestamp } from 'lightweight-charts';

export type DrawingKind =
  | 'trendline'
  | 'horizontal'
  | 'vertical'
  | 'ray'
  | 'rectangle'
  | 'fibonacci'
  | 'fibFan'
  | 'channel';

export type ToolMode = 'none' | DrawingKind;

export interface DrawingPoint {
  time: UTCTimestamp;
  price: number;
}

export interface DrawingShape {
  id: string;
  kind: DrawingKind;
  chartId: string;
  points: DrawingPoint[];
  color: string;
  width: number;
}

export function pointsForKind(kind: DrawingKind): 1 | 2 {
  if (kind === 'horizontal' || kind === 'vertical') {
    return 1;
  }
  return 2;
}

export const FIB_LEVELS: number[] = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
