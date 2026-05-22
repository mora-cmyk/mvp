import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MOCK_INSTRUMENTS } from '../mocks/instruments';
import type {
  ChartType,
  CustomTimeFrame,
  LayoutKind,
  ScaleMode,
  ThemeName,
  TimeFrameKey,
} from '../types/chart';
import type {
  IndicatorInstance,
  IndicatorParams,
} from '../types/indicator';
import type { ChartCellState, ChartLayoutState } from './chartTypes';

let cellSeq = 0;
function nextCellId(): string {
  cellSeq += 1;
  return `cell-${cellSeq}`;
}

let indicatorSeq = 0;
function nextIndicatorId(): string {
  indicatorSeq += 1;
  return `ind-${indicatorSeq}`;
}

function createCell(instrumentId: string): ChartCellState {
  return {
    id: nextCellId(),
    instrumentId,
    chartType: 'candlestick',
    timeframeKey: '1m',
    customTimeframe: { size: 1, unit: 'minutes' },
    indicators: [],
    scaleMode: 'normal',
    showCrosshair: true,
    showVolume: true,
    showOrders: true,
    showTrades: true,
    overlayInstrumentId: null,
  };
}

const firstInstrument = MOCK_INSTRUMENTS[0].id;
const initialCell = createCell(firstInstrument);

const initialState: ChartLayoutState = {
  layout: 'single',
  activeCellId: initialCell.id,
  cells: [initialCell],
  theme: 'dark',
};

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setLayout(state, action: PayloadAction<LayoutKind>) {
      state.layout = action.payload;
      const desired = layoutCount(action.payload);
      while (state.cells.length < desired) {
        const seed =
          MOCK_INSTRUMENTS[state.cells.length % MOCK_INSTRUMENTS.length].id;
        state.cells.push(createCell(seed));
      }
      if (state.cells.length > desired) {
        state.cells = state.cells.slice(0, desired);
        if (!state.cells.some((c) => c.id === state.activeCellId)) {
          state.activeCellId = state.cells[0].id;
        }
      }
    },
    setActiveCell(state, action: PayloadAction<string>) {
      if (state.cells.some((c) => c.id === action.payload)) {
        state.activeCellId = action.payload;
      }
    },
    setTheme(state, action: PayloadAction<ThemeName>) {
      state.theme = action.payload;
    },
    setInstrument(
      state,
      action: PayloadAction<{ cellId: string; instrumentId: string }>,
    ) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.instrumentId = action.payload.instrumentId;
      }
    },
    setOverlayInstrument(
      state,
      action: PayloadAction<{ cellId: string; instrumentId: string | null }>,
    ) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.overlayInstrumentId = action.payload.instrumentId;
      }
    },
    setChartType(
      state,
      action: PayloadAction<{ cellId: string; chartType: ChartType }>,
    ) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.chartType = action.payload.chartType;
      }
    },
    setTimeframe(
      state,
      action: PayloadAction<{
        cellId: string;
        key: TimeFrameKey;
        timeframe: CustomTimeFrame;
      }>,
    ) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.timeframeKey = action.payload.key;
        cell.customTimeframe = action.payload.timeframe;
      }
    },
    setScaleMode(
      state,
      action: PayloadAction<{ cellId: string; mode: ScaleMode }>,
    ) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.scaleMode = action.payload.mode;
      }
    },
    toggleCrosshair(state, action: PayloadAction<{ cellId: string }>) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.showCrosshair = !cell.showCrosshair;
      }
    },
    toggleVolume(state, action: PayloadAction<{ cellId: string }>) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.showVolume = !cell.showVolume;
      }
    },
    toggleOrders(state, action: PayloadAction<{ cellId: string }>) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.showOrders = !cell.showOrders;
      }
    },
    toggleTrades(state, action: PayloadAction<{ cellId: string }>) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.showTrades = !cell.showTrades;
      }
    },
    addIndicator(
      state,
      action: PayloadAction<{ cellId: string; config: IndicatorParams }>,
    ) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        const inst: IndicatorInstance = {
          id: nextIndicatorId(),
          config: action.payload.config,
        };
        cell.indicators.push(inst);
      }
    },
    removeIndicator(
      state,
      action: PayloadAction<{ cellId: string; indicatorId: string }>,
    ) {
      const cell = findCell(state, action.payload.cellId);
      if (cell) {
        cell.indicators = cell.indicators.filter(
          (i) => i.id !== action.payload.indicatorId,
        );
      }
    },
    duplicateCell(state, action: PayloadAction<{ cellId: string }>) {
      const idx = state.cells.findIndex((c) => c.id === action.payload.cellId);
      if (idx === -1) {
        return;
      }
      const desired = layoutCount(state.layout);
      if (state.cells.length >= desired) {
        return;
      }
      const cloned: ChartCellState = {
        ...state.cells[idx],
        id: nextCellId(),
        indicators: state.cells[idx].indicators.map((i) => ({
          ...i,
          id: nextIndicatorId(),
        })),
      };
      state.cells.splice(idx + 1, 0, cloned);
    },
  },
});

function findCell(
  state: ChartLayoutState,
  cellId: string,
): ChartCellState | undefined {
  return state.cells.find((c) => c.id === cellId);
}

function layoutCount(layout: LayoutKind): number {
  switch (layout) {
    case 'single':
      return 1;
    case 'double-h':
    case 'double-v':
      return 2;
    case 'triple':
      return 3;
    case 'quadruple':
      return 4;
  }
}

export const chartReducer = chartSlice.reducer;
export const chartActions = chartSlice.actions;
