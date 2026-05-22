import { useAppDispatch, useAppSelector } from '../../app/store';
import { chartActions } from '../../store/chartSlice';
import { LAYOUTS } from '../Chart/utils/constants';
import MultiStyles from './MultiChart.module.css';

export function LayoutSelector() {
  const dispatch = useAppDispatch();
  const layout = useAppSelector((s) => s.chart.layout);
  return (
    <div className={MultiStyles.layoutSelector}>
      {LAYOUTS.map((l) => (
        <button
          key={l.value}
          type="button"
          className={`${MultiStyles.layoutBtn} ${
            layout === l.value ? MultiStyles.layoutBtnActive : ''
          }`}
          onClick={() => dispatch(chartActions.setLayout(l.value))}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
