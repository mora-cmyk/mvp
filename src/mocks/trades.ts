import type { TradeMarker } from '../types/order';

export interface TradeSpec {
  offsetFromLast: number;
  side: 'buy' | 'sell';
  quantity: number;
}

export const MOCK_TRADE_SPECS: TradeSpec[] = [
  { offsetFromLast: 10, side: 'buy', quantity: 50 },
  { offsetFromLast: 25, side: 'sell', quantity: 30 },
  { offsetFromLast: 60, side: 'buy', quantity: 80 },
  { offsetFromLast: 120, side: 'sell', quantity: 25 },
];

export function emptyTradeMarkers(): TradeMarker[] {
  return [];
}
