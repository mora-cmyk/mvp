import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { chartReducer } from '../store/chartSlice';
import { ordersReducer } from '../store/ordersSlice';
import { drawingsReducer } from '../store/drawingsSlice';

export const store = configureStore({
  reducer: {
    chart: chartReducer,
    orders: ordersReducer,
    drawings: drawingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
