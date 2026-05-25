import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { ChartHeader } from '../components/ChartHeader/ChartHeader';
import { MultiChart } from '../components/MultiChart/MultiChart';
import { LayoutSelector } from '../components/MultiChart/LayoutSelector';
import { getTheme } from '../components/Chart/utils/themePresets';
import type { ToolMode } from '../types/drawing';
import { useAppSelector } from './store';
import AppStyles from './App.module.css';

export function App() {
  const theme = useAppSelector((s) => s.chart.theme);
  const palette = getTheme(theme);
  const [drawingMode, setDrawingMode] = useState<ToolMode>('none');
  const canvasGetterRef = useRef<() => HTMLCanvasElement | null>(() => null);

  const registerCanvasGetter = useCallback(
    (g: () => HTMLCanvasElement | null) => {
      canvasGetterRef.current = g;
    },
    [],
  );

  const css: CSSProperties = {
    ['--app-bg' as string]: palette.background,
    ['--app-text' as string]: palette.text,
    ['--app-border' as string]: palette.border,
    ['--app-toolbar-bg' as string]: palette.toolbarBg,
    ['--toolbar-bg' as string]: palette.toolbarBg,
    ['--toolbar-text' as string]: palette.toolbarText,
    ['--toolbar-border' as string]: palette.border,
    ['--toolbar-accent' as string]: palette.accent,
    ['--multi-bg' as string]: palette.panelBg,
  };

  return (
    <div className={AppStyles.app} style={css}>
      <div className={AppStyles.toolbarRow}>
        <span className={AppStyles.layoutsLabel}>Layout:</span>
        <LayoutSelector />
      </div>
      <ChartHeader
        drawingMode={drawingMode}
        onDrawingChange={setDrawingMode}
        getActiveChartCanvas={() => canvasGetterRef.current()}
      />
      <div className={AppStyles.body}>
        <MultiChart
          drawingMode={drawingMode}
          onDrawingFinished={() => setDrawingMode('none')}
          registerCanvasGetter={registerCanvasGetter}
        />
      </div>
    </div>
  );
}
