import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { chartActions } from '../../store/chartSlice';
import { CUSTOM_TF_UNITS, TIMEFRAMES } from '../Chart/utils/constants';
import type { TimeFrameKey, TimeFrameUnit } from '../../types/chart';
import HeaderStyles from './ChartHeader.module.css';

export function TimeframeSelector() {
  const dispatch = useAppDispatch();
  const activeCell = useAppSelector(
    (s) => s.chart.cells.find((c) => c.id === s.chart.activeCellId) ?? null,
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [customSize, setCustomSize] = useState(2);
  const [customUnit, setCustomUnit] = useState<TimeFrameUnit>('hours');

  if (!activeCell) {
    return null;
  }

  const handlePreset = (key: TimeFrameKey): void => {
    const preset = TIMEFRAMES.find((t) => t.key === key);
    if (!preset) {
      return;
    }
    dispatch(
      chartActions.setTimeframe({
        cellId: activeCell.id,
        key,
        timeframe: { size: preset.size, unit: preset.unit },
      }),
    );
  };

  const handleCustomApply = (): void => {
    dispatch(
      chartActions.setTimeframe({
        cellId: activeCell.id,
        key: 'custom',
        timeframe: { size: customSize, unit: customUnit },
      }),
    );
    setCustomOpen(false);
  };

  return (
    <div className={HeaderStyles.group}>
      <span className={HeaderStyles.label}>TF</span>
      <div className={HeaderStyles.tfBar}>
        {TIMEFRAMES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${HeaderStyles.tfBtn} ${
              activeCell.timeframeKey === t.key ? HeaderStyles.tfBtnActive : ''
            }`}
            onClick={() => handlePreset(t.key)}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          className={`${HeaderStyles.tfBtn} ${
            activeCell.timeframeKey === 'custom' ? HeaderStyles.tfBtnActive : ''
          }`}
          onClick={() => setCustomOpen((v) => !v)}
        >
          Custom
        </button>
      </div>
      {customOpen && (
        <div className={HeaderStyles.customTfRow}>
          <input
            className={HeaderStyles.customNumber}
            type="number"
            min={1}
            max={999}
            value={customSize}
            onChange={(e) =>
              setCustomSize(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
          />
          <select
            className={HeaderStyles.select}
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as TimeFrameUnit)}
          >
            {CUSTOM_TF_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={HeaderStyles.btn}
            onClick={handleCustomApply}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
