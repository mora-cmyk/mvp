import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DrawingShape } from '../types/drawing';

export interface DrawingsState {
  drawings: DrawingShape[];
}

const initialState: DrawingsState = {
  drawings: [],
};

const drawingsSlice = createSlice({
  name: 'drawings',
  initialState,
  reducers: {
    addDrawing(state, action: PayloadAction<DrawingShape>) {
      state.drawings.push(action.payload);
    },
    updateDrawing(state, action: PayloadAction<DrawingShape>) {
      const idx = state.drawings.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        state.drawings[idx] = action.payload;
      }
    },
    removeDrawing(state, action: PayloadAction<string>) {
      state.drawings = state.drawings.filter((d) => d.id !== action.payload);
    },
    clearForChart(state, action: PayloadAction<string>) {
      state.drawings = state.drawings.filter(
        (d) => d.chartId !== action.payload,
      );
    },
  },
});

export const drawingsReducer = drawingsSlice.reducer;
export const drawingsActions = drawingsSlice.actions;
