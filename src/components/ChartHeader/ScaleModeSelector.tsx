import { useAppDispatch, useAppSelector } from '../../app/store';
import { chartActions } from '../../store/chartSlice';
import type { ScaleMode } from '../../types/chart';
import HeaderStyles from './ChartHeader.module.css';

const MODES: { value: ScaleMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'log', label: 'Log' },
  { value: 'percent', label: '%' },
];

export function ScaleModeSelector() {
  const dispatch = useAppDispatch();
  const activeCell = useAppSelector(
    (s) => s.chart.cells.find((c) => c.id === s.chart.activeCellId) ?? null,
  );
  if (!activeCell) {
    return null;
  }
  return (
    <div className={HeaderStyles.group}>
      <span className={HeaderStyles.label}>Scale</span>
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          className={`${HeaderStyles.btn} ${
            activeCell.scaleMode === m.value ? HeaderStyles.btnActive : ''
          }`}
          onClick={() =>
            dispatch(
              chartActions.setScaleMode({
                cellId: activeCell.id,
                mode: m.value,
              }),
            )
          }
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
