import { useEffect, useRef, useState } from 'react';
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';

export interface ChartContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  price: number | null;
  time: number | null;
}

interface UseContextMenuOptions {
  containerEl: HTMLElement | null;
  chart: IChartApi | null;
  series: ISeriesApi<SeriesType> | null;
}

export interface UseContextMenuResult {
  state: ChartContextMenuState;
  close: () => void;
}

export function useContextMenu(
  opts: UseContextMenuOptions,
): UseContextMenuResult {
  const { containerEl, chart, series } = opts;
  const [state, setState] = useState<ChartContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    price: null,
    time: null,
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!containerEl) {
      return undefined;
    }
    const onMenu = (ev: MouseEvent): void => {
      ev.preventDefault();
      if (!chart || !series) {
        return;
      }
      const rect = containerEl.getBoundingClientRect();
      const localX = ev.clientX - rect.left;
      const localY = ev.clientY - rect.top;
      const price = series.coordinateToPrice(localY);
      const time = chart.timeScale().coordinateToTime(localX);
      setState({
        visible: true,
        x: localX,
        y: localY,
        price: price === null ? null : Number(price),
        time: time === null ? null : Number(time),
      });
    };
    const onDocClick = (ev: MouseEvent): void => {
      if (
        stateRef.current.visible &&
        ev.target instanceof Node &&
        !containerEl.contains(ev.target)
      ) {
        setState((s) => ({ ...s, visible: false }));
      }
    };
    containerEl.addEventListener('contextmenu', onMenu);
    document.addEventListener('mousedown', onDocClick);
    return () => {
      containerEl.removeEventListener('contextmenu', onMenu);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [containerEl, chart, series]);

  const close = (): void => {
    setState((s) => ({ ...s, visible: false }));
  };

  return { state, close };
}
