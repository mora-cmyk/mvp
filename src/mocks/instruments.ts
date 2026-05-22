import type { Instrument } from '../types/chart';

export const MOCK_INSTRUMENTS: Instrument[] = [
  { id: 'AAPL.NASDAQ', symbol: 'AAPL', name: 'Apple Inc.', basePrice: 185 },
  { id: 'TSLA.NASDAQ', symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 240 },
  { id: 'BTC.USD', symbol: 'BTC/USD', name: 'Bitcoin', basePrice: 67000 },
];
