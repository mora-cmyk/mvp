import { useAppSelector } from '../../app/store';
import HeaderStyles from './ChartHeader.module.css';

interface ScreenshotButtonProps {
  getActiveChartCanvas: () => HTMLCanvasElement | null;
}

export function ScreenshotButton(props: ScreenshotButtonProps) {
  const activeCellId = useAppSelector((s) => s.chart.activeCellId);
  const handleDownload = (): void => {
    const canvas = props.getActiveChartCanvas();
    if (!canvas) {
      return;
    }
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${activeCellId}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  return (
    <button
      type="button"
      className={HeaderStyles.btn}
      onClick={handleDownload}
    >
      Screenshot
    </button>
  );
}
