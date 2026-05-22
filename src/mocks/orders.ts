import type { Order, PriceAlert } from '../types/order';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    instrumentId: 'AAPL.NASDAQ',
    price: 182,
    side: 'buy',
    quantity: 100,
    label: 'Buy 100 @ 182',
  },
  {
    id: 'ord-2',
    instrumentId: 'AAPL.NASDAQ',
    price: 190,
    side: 'sell',
    quantity: 100,
    label: 'Sell 100 @ 190',
  },
];

export const MOCK_ALERTS: PriceAlert[] = [
  {
    id: 'alrt-1',
    instrumentId: 'AAPL.NASDAQ',
    price: 188,
    label: 'Alert @ 188',
  },
];
