export type OrderSide = 'buy' | 'sell';

export interface Order {
  id: string;
  instrumentId: string;
  price: number;
  side: OrderSide;
  quantity: number;
  label: string;
}

export interface PriceAlert {
  id: string;
  instrumentId: string;
  price: number;
  label: string;
}

export interface TradeMarker {
  id: string;
  instrumentId: string;
  time: number;
  price: number;
  side: OrderSide;
  quantity: number;
}
