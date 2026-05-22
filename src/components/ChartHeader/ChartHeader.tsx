import type { CSSProperties } from 'react';
import { useAppSelector } from '../../app/store';
import { getTheme } from '../Chart/utils/themePresets';
import { ChartTypeSelector } from './ChartTypeSelector';
import { CrosshairToggle } from './CrosshairToggle';
import { DrawingToolsPanel } from './DrawingToolsPanel';
import { IndicatorsPanel } from './IndicatorsPanel';
import { InstrumentDragHandle } from './InstrumentDragHandle';
import { InstrumentSelector } from './InstrumentSelector';
import { ScaleModeSelector } from './ScaleModeSelector';
import { ScreenshotButton } from './ScreenshotButton';
import { ThemeSelector } from './ThemeSelector';
import { TimeframeSelector } from './TimeframeSelector';
import HeaderStyles from './ChartHeader.module.css';

interface ChartHeaderProps {
  drawingMode: 'none' | 'trendline';
  onDrawingChange: (mode: 'none' | 'trendline') => void;
  getActiveChartCanvas: () => HTMLCanvasElement | null;
}

export function ChartHeader(props: ChartHeaderProps) {
  const theme = useAppSelector((s) => s.chart.theme);
  const palette = getTheme(theme);
  const css: CSSProperties = {
    ['--toolbar-bg' as string]: palette.toolbarBg,
    ['--toolbar-text' as string]: palette.toolbarText,
    ['--toolbar-border' as string]: palette.border,
    ['--toolbar-accent' as string]: palette.accent,
  };
  return (
    <div className={HeaderStyles.toolbar} style={css}>
      <InstrumentSelector />
      <ChartTypeSelector />
      <TimeframeSelector />
      <IndicatorsPanel />
      <DrawingToolsPanel
        drawingMode={props.drawingMode}
        onChange={props.onDrawingChange}
      />
      <ScaleModeSelector />
      <CrosshairToggle />
      <ScreenshotButton getActiveChartCanvas={props.getActiveChartCanvas} />
      <ThemeSelector />
      <div className={HeaderStyles.spacer} />
      <InstrumentDragHandle />
    </div>
  );
}
