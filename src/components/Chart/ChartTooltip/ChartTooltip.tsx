import type { CSSProperties } from 'react';
import type { TooltipState } from '../hooks/useCrosshairTooltip';
import type { ThemePalette } from '../utils/themePresets';
import { formatPrice, formatVolume } from '../utils/formatPrice';
import TooltipStyles from './ChartTooltip.module.css';

interface ChartTooltipProps {
  state: TooltipState;
  palette: ThemePalette;
  containerWidth: number;
  containerHeight: number;
}

export function ChartTooltip(props: ChartTooltipProps): JSX.Element | null {
  const { state, palette, containerWidth, containerHeight } = props;
  if (!state.visible || !state.candle) {
    return null;
  }
  const margin = 12;
  const w = 170;
  const h = 130;
  let left = state.x + margin;
  let top = state.y + margin;
  if (left + w > containerWidth) {
    left = state.x - margin - w;
  }
  if (top + h > containerHeight) {
    top = state.y - margin - h;
  }
  const c = state.candle;
  const dirClass =
    c.close >= c.open ? TooltipStyles.up : TooltipStyles.down;
  const cssVars: CSSProperties = {
    left,
    top,
    ['--tooltip-bg' as string]: palette.tooltipBg,
    ['--tooltip-border' as string]: palette.tooltipBorder,
    ['--tooltip-text' as string]: palette.tooltipText,
  };
  const dateStr = new Date((state.time ?? 0) * 1000).toLocaleString();
  return (
    <div className={TooltipStyles.tooltip} style={cssVars}>
      <div className={TooltipStyles.title}>{dateStr}</div>
      <div className={TooltipStyles.row}>
        <span className={TooltipStyles.label}>O</span>
        <span className={`${TooltipStyles.value} ${dirClass}`}>
          {formatPrice(c.open)}
        </span>
      </div>
      <div className={TooltipStyles.row}>
        <span className={TooltipStyles.label}>H</span>
        <span className={`${TooltipStyles.value} ${dirClass}`}>
          {formatPrice(c.high)}
        </span>
      </div>
      <div className={TooltipStyles.row}>
        <span className={TooltipStyles.label}>L</span>
        <span className={`${TooltipStyles.value} ${dirClass}`}>
          {formatPrice(c.low)}
        </span>
      </div>
      <div className={TooltipStyles.row}>
        <span className={TooltipStyles.label}>C</span>
        <span className={`${TooltipStyles.value} ${dirClass}`}>
          {formatPrice(c.close)}
        </span>
      </div>
      <div className={TooltipStyles.row}>
        <span className={TooltipStyles.label}>Vol</span>
        <span className={TooltipStyles.value}>{formatVolume(c.volume)}</span>
      </div>
    </div>
  );
}
