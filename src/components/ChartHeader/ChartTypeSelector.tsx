import { useAppDispatch, useAppSelector } from '../../app/store';
import { chartActions } from '../../store/chartSlice';
import { CHART_TYPES } from '../Chart/utils/constants';
import type { ChartType } from '../../types/chart';
import HeaderStyles from './ChartHeader.module.css';

export function ChartTypeSelector() {
  const dispatch = useAppDispatch();
  const activeCell = useAppSelector(
    (s) => s.chart.cells.find((c) => c.id === s.chart.activeCellId) ?? null,
  );
  if (!activeCell) {
    return null;
  }
  return (
    <div className={HeaderStyles.group}>
      <span className={HeaderStyles.label}>Type</span>
      <select
        className={HeaderStyles.select}
        value={activeCell.chartType}
        onChange={(e) =>
          dispatch(
            chartActions.setChartType({
              cellId: activeCell.id,
              chartType: e.target.value as ChartType,
            }),
          )
        }
      >
        {CHART_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
