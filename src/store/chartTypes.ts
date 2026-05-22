import type {
  ChartType,
  CustomTimeFrame,
  LayoutKind,
  ScaleMode,
  ThemeName,
  TimeFrameKey,
} from '../types/chart';
import type { IndicatorInstance } from '../types/indicator';

export interface ChartCellState {
  id: string;
  instrumentId: string;
  chartType: ChartType;
  timeframeKey: TimeFrameKey;
  customTimeframe: CustomTimeFrame;
  indicators: IndicatorInstance[];
  scaleMode: ScaleMode;
  showCrosshair: boolean;
  showVolume: boolean;
  showOrders: boolean;
  showTrades: boolean;
  overlayInstrumentId: string | null;
}

export interface ChartLayoutState {
  layout: LayoutKind;
  activeCellId: string;
  cells: ChartCellState[];
  theme: ThemeName;
}
