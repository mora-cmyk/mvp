import { useEffect, useRef } from 'react';
import {
  LineStyle,
  type IPriceLine,
  type ISeriesApi,
  type SeriesType,
} from 'lightweight-charts';
import type { Order, PriceAlert } from '../../../types/order';
import type { ThemePalette } from '../utils/themePresets';

interface UseOrdersOnChartOptions {
  series: ISeriesApi<SeriesType> | null;
  orders: Order[];
  alerts: PriceAlert[];
  palette: ThemePalette;
  visible: boolean;
}

export function useOrdersOnChart(opts: UseOrdersOnChartOptions): void {
  const { series, orders, alerts, palette, visible } = opts;
  const linesRef = useRef<Map<string, IPriceLine>>(new Map());

  useEffect(() => {
    if (!series) {
      return;
    }
    const map = linesRef.current;
    map.forEach((line) => {
      try {
        series.removePriceLine(line);
      } catch {
        // ignore
      }
    });
    map.clear();
    if (!visible) {
      return;
    }
    orders.forEach((o) => {
      const line = series.createPriceLine({
        price: o.price,
        color: o.side === 'buy' ? palette.orderBuy : palette.orderSell,
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: o.label,
      });
      map.set(`order-${o.id}`, line);
    });
    alerts.forEach((a) => {
      const line = series.createPriceLine({
        price: a.price,
        color: palette.alert,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: a.label,
      });
      map.set(`alert-${a.id}`, line);
    });
  }, [series, orders, alerts, palette, visible]);

  useEffect(() => {
    return () => {
      const map = linesRef.current;
      const s = opts.series;
      if (s) {
        map.forEach((line) => {
          try {
            s.removePriceLine(line);
          } catch {
            // ignore
          }
        });
      }
      map.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
