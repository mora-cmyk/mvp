export type IndicatorKind = 'SMA' | 'EMA' | 'BB' | 'RSI' | 'MACD';

export interface SmaParams {
  period: number;
  color: string;
}

export interface EmaParams {
  period: number;
  color: string;
}

export interface BBParams {
  period: number;
  stdDev: number;
  color: string;
}

export interface RsiParams {
  period: number;
  color: string;
}

export interface MacdParams {
  fast: number;
  slow: number;
  signal: number;
}

export type IndicatorParams =
  | { kind: 'SMA'; params: SmaParams }
  | { kind: 'EMA'; params: EmaParams }
  | { kind: 'BB'; params: BBParams }
  | { kind: 'RSI'; params: RsiParams }
  | { kind: 'MACD'; params: MacdParams };

export interface IndicatorInstance {
  id: string;
  config: IndicatorParams;
}
