import { useEffect, useRef } from 'react';
import { Chart } from '../Chart/Chart';
import { useAppSelector } from '../../app/store';
import type { LayoutKind } from '../../types/chart';
import type { ToolMode } from '../../types/drawing';
import { useChartSync } from './hooks/useChartSync';
import MultiStyles from './MultiChart.module.css';

interface MultiChartProps {
  drawingMode: ToolMode;
  onDrawingFinished: () => void;
  registerCanvasGetter: (getter: () => HTMLCanvasElement | null) => void;
}

const LAYOUT_CLASS: Record<LayoutKind, string> = {
  single: MultiStyles.single,
  'double-h': MultiStyles.doubleH,
  'double-v': MultiStyles.doubleV,
  triple: MultiStyles.triple,
  quadruple: MultiStyles.quadruple,
};

type RefSetter = (node: HTMLDivElement | null) => void;

export function MultiChart(props: MultiChartProps) {
  const layout = useAppSelector((s) => s.chart.layout);
  const cells = useAppSelector((s) => s.chart.cells);
  const activeCellId = useAppSelector((s) => s.chart.activeCellId);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const refSetters = useRef<Map<string, RefSetter>>(new Map());
  useChartSync();

  const getRefSetter = (id: string): RefSetter => {
    const cached = refSetters.current.get(id);
    if (cached) {
      return cached;
    }
    const cb: RefSetter = (node) => {
      if (node) {
        cellRefs.current.set(id, node);
      } else {
        cellRefs.current.delete(id);
      }
    };
    refSetters.current.set(id, cb);
    return cb;
  };

  const { registerCanvasGetter } = props;
  useEffect(() => {
    registerCanvasGetter(() => {
      const cell = cellRefs.current.get(activeCellId);
      if (!cell) {
        return null;
      }
      return cell.querySelector('canvas');
    });
  }, [registerCanvasGetter, activeCellId]);

  return (
    <div className={`${MultiStyles.root} ${LAYOUT_CLASS[layout]}`}>
      {cells.map((cell) => (
        <div
          key={cell.id}
          ref={getRefSetter(cell.id)}
          className={MultiStyles.cell}
        >
          <Chart
            cell={cell}
            drawingMode={props.drawingMode}
            onDrawingFinished={props.onDrawingFinished}
          />
        </div>
      ))}
    </div>
  );
}
