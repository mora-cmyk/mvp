import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createChart,
  CrosshairMode,
  type IChartApi,
} from 'lightweight-charts';
import {
  chartOptionsForTheme,
  getTheme,
  type ThemePalette,
} from '../utils/themePresets';
import type { ThemeName } from '../../../types/chart';

export interface UseChartInstanceResult {
  containerRef: (node: HTMLDivElement | null) => void;
  chart: IChartApi | null;
  palette: ThemePalette;
}

export function useChartInstance(theme: ThemeName): UseChartInstanceResult {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const palette = getTheme(theme);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node);
  }, []);

  useEffect(() => {
    if (!containerEl) {
      return undefined;
    }
    const initialWidth = containerEl.clientWidth || 600;
    const initialHeight = containerEl.clientHeight || 400;
    const instance = createChart(containerEl, {
      width: initialWidth,
      height: initialHeight,
      autoSize: true,
      ...chartOptionsForTheme(palette),
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: palette.crosshair },
        horzLine: { color: palette.crosshair },
      },
    });
    setChart(instance);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        instance.applyOptions({
          width: containerEl.clientWidth,
          height: containerEl.clientHeight,
        });
      });
      ro.observe(containerEl);
    }

    return () => {
      if (ro) {
        ro.disconnect();
      }
      try {
        instance.remove();
      } catch {
        // ignore
      }
    };
    // palette change is handled by the next effect; we don't recreate the chart on theme change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerEl]);

  const chartRef = useRef<IChartApi | null>(null);
  chartRef.current = chart;

  useEffect(() => {
    const c = chartRef.current;
    if (!c) {
      return;
    }
    c.applyOptions(chartOptionsForTheme(palette));
  }, [palette]);

  return { containerRef, chart, palette };
}
