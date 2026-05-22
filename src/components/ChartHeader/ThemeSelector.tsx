import { useAppDispatch, useAppSelector } from '../../app/store';
import { chartActions } from '../../store/chartSlice';
import type { ThemeName } from '../../types/chart';
import HeaderStyles from './ChartHeader.module.css';

const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'grey', label: 'Grey' },
];

export function ThemeSelector() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.chart.theme);
  return (
    <div className={HeaderStyles.group}>
      <span className={HeaderStyles.label}>Theme</span>
      {THEMES.map((t) => (
        <button
          key={t.value}
          type="button"
          className={`${HeaderStyles.btn} ${
            theme === t.value ? HeaderStyles.btnActive : ''
          }`}
          onClick={() => dispatch(chartActions.setTheme(t.value))}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
