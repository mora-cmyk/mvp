import { useAppDispatch, useAppSelector } from '../../app/store';
import { drawingsActions } from '../../store/drawingsSlice';
import type { ToolMode } from '../../types/drawing';
import { DRAWING_TOOLS } from '../Chart/utils/constants';
import HeaderStyles from './ChartHeader.module.css';

interface DrawingToolsPanelProps {
  drawingMode: ToolMode;
  onChange: (mode: ToolMode) => void;
}

export function DrawingToolsPanel(props: DrawingToolsPanelProps) {
  const { drawingMode, onChange } = props;
  const dispatch = useAppDispatch();
  const activeCellId = useAppSelector((s) => s.chart.activeCellId);
  const drawingsCount = useAppSelector(
    (s) =>
      s.drawings.drawings.filter((d) => d.chartId === activeCellId).length,
  );
  return (
    <div className={HeaderStyles.group}>
      <span className={HeaderStyles.label}>Draw</span>
      {DRAWING_TOOLS.map((t) => (
        <button
          key={t.value}
          type="button"
          className={`${HeaderStyles.btn} ${
            drawingMode === t.value ? HeaderStyles.btnActive : ''
          }`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
      {drawingsCount > 0 && (
        <button
          type="button"
          className={HeaderStyles.btn}
          onClick={() => dispatch(drawingsActions.clearForChart(activeCellId))}
        >
          Clear ({drawingsCount})
        </button>
      )}
    </div>
  );
}
