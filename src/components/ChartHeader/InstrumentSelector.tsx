import { useAppDispatch, useAppSelector } from '../../app/store';
import { MOCK_INSTRUMENTS } from '../../mocks/instruments';
import { chartActions } from '../../store/chartSlice';
import HeaderStyles from './ChartHeader.module.css';

export function InstrumentSelector() {
  const dispatch = useAppDispatch();
  const activeCell = useAppSelector((s) => {
    return s.chart.cells.find((c) => c.id === s.chart.activeCellId) ?? null;
  });
  if (!activeCell) {
    return null;
  }
  return (
    <div className={HeaderStyles.group}>
      <span className={HeaderStyles.label}>Instrument</span>
      <select
        className={HeaderStyles.select}
        value={activeCell.instrumentId}
        onChange={(e) =>
          dispatch(
            chartActions.setInstrument({
              cellId: activeCell.id,
              instrumentId: e.target.value,
            }),
          )
        }
      >
        {MOCK_INSTRUMENTS.map((i) => (
          <option key={i.id} value={i.id}>
            {i.symbol} — {i.name}
          </option>
        ))}
      </select>
      <span className={HeaderStyles.label}>Overlay</span>
      <select
        className={HeaderStyles.select}
        value={activeCell.overlayInstrumentId ?? ''}
        onChange={(e) =>
          dispatch(
            chartActions.setOverlayInstrument({
              cellId: activeCell.id,
              instrumentId: e.target.value || null,
            }),
          )
        }
      >
        <option value="">None</option>
        {MOCK_INSTRUMENTS.filter((i) => i.id !== activeCell.instrumentId).map(
          (i) => (
            <option key={i.id} value={i.id}>
              {i.symbol}
            </option>
          ),
        )}
      </select>
    </div>
  );
}
