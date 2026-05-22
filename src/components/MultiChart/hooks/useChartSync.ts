import { useEffect, useState } from 'react';
import type {
  LogicalRange,
  MouseEventParams,
  Time,
} from 'lightweight-charts';
import {
  subscribeRegistry,
  type RegisteredChart,
} from '../chartRegistry';

export function useChartSync(): void {
  const [charts, setCharts] = useState<RegisteredChart[]>([]);

  useEffect(() => subscribeRegistry(setCharts), []);

  useEffect(() => {
    if (charts.length < 2) {
      return undefined;
    }
    let syncing = false;

    const crossHandlers = charts.map((src) => {
      const handler = (param: MouseEventParams<Time>): void => {
        if (syncing) {
          return;
        }
        syncing = true;
        try {
          charts.forEach((other) => {
            if (other.cellId === src.cellId) {
              return;
            }
            if (param.time !== undefined && param.point) {
              const price = other.series.coordinateToPrice(param.point.y);
              if (price !== null) {
                other.chart.setCrosshairPosition(
                  Number(price),
                  param.time,
                  other.series,
                );
              }
            } else {
              other.chart.clearCrosshairPosition();
            }
          });
        } finally {
          syncing = false;
        }
      };
      src.chart.subscribeCrosshairMove(handler);
      return { chart: src.chart, handler };
    });

    const rangeHandlers = charts.map((src) => {
      const handler = (range: LogicalRange | null): void => {
        if (syncing || !range) {
          return;
        }
        syncing = true;
        try {
          charts.forEach((other) => {
            if (other.cellId === src.cellId) {
              return;
            }
            other.chart.timeScale().setVisibleLogicalRange(range);
          });
        } finally {
          syncing = false;
        }
      };
      src.chart.timeScale().subscribeVisibleLogicalRangeChange(handler);
      return { chart: src.chart, handler };
    });

    return () => {
      crossHandlers.forEach(({ chart, handler }) => {
        chart.unsubscribeCrosshairMove(handler);
      });
      rangeHandlers.forEach(({ chart, handler }) => {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(handler);
      });
    };
  }, [charts]);
}
