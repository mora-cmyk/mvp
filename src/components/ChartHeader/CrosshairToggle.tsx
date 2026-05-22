import { useAppDispatch, useAppSelector } from '../../app/store';
import { chartActions } from '../../store/chartSlice';
import HeaderStyles from './ChartHeader.module.css';

export function CrosshairToggle() {
  const dispatch = useAppDispatch();
  const activeCell = useAppSelector(
    (s) => s.chart.cells.find((c) => c.id === s.chart.activeCellId) ?? null,
  );
  if (!activeCell) {
    return null;
  }
  return (
    <div className={HeaderStyles.group}>
      <button
        type="button"
        className={`${HeaderStyles.btn} ${
          activeCell.showCrosshair ? HeaderStyles.btnActive : ''
        }`}
        onClick={() =>
          dispatch(chartActions.toggleCrosshair({ cellId: activeCell.id }))
        }
      >
        Crosshair
      </button>
      <button
        type="button"
        className={`${HeaderStyles.btn} ${
          activeCell.showVolume ? HeaderStyles.btnActive : ''
        }`}
        onClick={() =>
          dispatch(chartActions.toggleVolume({ cellId: activeCell.id }))
        }
      >
        Volume
      </button>
      <button
        type="button"
        className={`${HeaderStyles.btn} ${
          activeCell.showOrders ? HeaderStyles.btnActive : ''
        }`}
        onClick={() =>
          dispatch(chartActions.toggleOrders({ cellId: activeCell.id }))
        }
      >
        Orders
      </button>
      <button
        type="button"
        className={`${HeaderStyles.btn} ${
          activeCell.showTrades ? HeaderStyles.btnActive : ''
        }`}
        onClick={() =>
          dispatch(chartActions.toggleTrades({ cellId: activeCell.id }))
        }
      >
        Trades
      </button>
    </div>
  );
}
