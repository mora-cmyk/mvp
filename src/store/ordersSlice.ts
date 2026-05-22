import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MOCK_ALERTS, MOCK_ORDERS } from '../mocks/orders';
import { MOCK_TRADE_SPECS } from '../mocks/trades';
import type { Order, PriceAlert, TradeMarker } from '../types/order';

export interface OrdersState {
  orders: Order[];
  alerts: PriceAlert[];
  trades: TradeMarker[];
  tradeSpecs: typeof MOCK_TRADE_SPECS;
}

const initialState: OrdersState = {
  orders: MOCK_ORDERS,
  alerts: MOCK_ALERTS,
  trades: [],
  tradeSpecs: MOCK_TRADE_SPECS,
};

let orderSeq = 100;
let alertSeq = 100;

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Omit<Order, 'id' | 'label'>>) {
      orderSeq += 1;
      const order: Order = {
        ...action.payload,
        id: `ord-${orderSeq}`,
        label: `${action.payload.side === 'buy' ? 'Buy' : 'Sell'} ${
          action.payload.quantity
        } @ ${action.payload.price.toFixed(2)}`,
      };
      state.orders.push(order);
    },
    removeOrder(state, action: PayloadAction<string>) {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    },
    addAlert(state, action: PayloadAction<Omit<PriceAlert, 'id' | 'label'>>) {
      alertSeq += 1;
      const alert: PriceAlert = {
        ...action.payload,
        id: `alrt-${alertSeq}`,
        label: `Alert @ ${action.payload.price.toFixed(2)}`,
      };
      state.alerts.push(alert);
    },
    removeAlert(state, action: PayloadAction<string>) {
      state.alerts = state.alerts.filter((a) => a.id !== action.payload);
    },
    setTrades(state, action: PayloadAction<TradeMarker[]>) {
      state.trades = action.payload;
    },
  },
});

export const ordersReducer = ordersSlice.reducer;
export const ordersActions = ordersSlice.actions;
