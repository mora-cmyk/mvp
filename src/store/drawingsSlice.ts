import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TrendLineDrawing } from '../types/drawing';

export interface DrawingsState {
  trendLines: TrendLineDrawing[];
}

const initialState: DrawingsState = {
  trendLines: [],
};

const drawingsSlice = createSlice({
  name: 'drawings',
  initialState,
  reducers: {
    addTrendLine(state, action: PayloadAction<TrendLineDrawing>) {
      state.trendLines.push(action.payload);
    },
    updateTrendLine(state, action: PayloadAction<TrendLineDrawing>) {
      const idx = state.trendLines.findIndex(
        (d) => d.id === action.payload.id,
      );
      if (idx !== -1) {
        state.trendLines[idx] = action.payload;
      }
    },
    removeTrendLine(state, action: PayloadAction<string>) {
      state.trendLines = state.trendLines.filter((d) => d.id !== action.payload);
    },
    clearForChart(state, action: PayloadAction<string>) {
      state.trendLines = state.trendLines.filter(
        (d) => d.chartId !== action.payload,
      );
    },
  },
});

export const drawingsReducer = drawingsSlice.reducer;
export const drawingsActions = drawingsSlice.actions;
