import { useEffect } from 'react';
import { CrosshairMode, type IChartApi } from 'lightweight-charts';
import type { ThemePalette } from '../utils/themePresets';

interface UseCrosshairModeOptions {
  chart: IChartApi | null;
  palette: ThemePalette;
  enabled: boolean;
}

export function useCrosshairMode(opts: UseCrosshairModeOptions): void {
  const { chart, palette, enabled } = opts;
  useEffect(() => {
    if (!chart) {
      return;
    }
    chart.applyOptions({
      crosshair: {
        mode: enabled ? CrosshairMode.Normal : CrosshairMode.Hidden,
        vertLine: {
          color: palette.crosshair,
          visible: enabled,
          labelVisible: enabled,
        },
        horzLine: {
          color: palette.crosshair,
          visible: enabled,
          labelVisible: enabled,
        },
      },
    });
  }, [chart, enabled, palette]);
}
