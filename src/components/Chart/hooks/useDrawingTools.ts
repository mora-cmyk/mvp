import { useEffect, useRef, useState } from 'react';
import type {
  IChartApi,
  ISeriesApi,
  SeriesType,
  UTCTimestamp,
} from 'lightweight-charts';
import type { TrendLineDrawing } from '../../../types/drawing';
import type { ThemePalette } from '../utils/themePresets';
import { TrendLinePrimitive } from '../drawings/TrendLinePrimitive';

type ToolMode = 'none' | 'trendline';

interface UseDrawingToolsOptions {
  chart: IChartApi | null;
  series: ISeriesApi<SeriesType> | null;
  containerEl: HTMLElement | null;
  chartId: string;
  drawings: TrendLineDrawing[];
  toolMode: ToolMode;
  palette: ThemePalette;
  onAddTrendLine: (d: TrendLineDrawing) => void;
  onUpdateTrendLine: (d: TrendLineDrawing) => void;
  onFinish: () => void;
}

interface DraftState {
  start: { time: UTCTimestamp; price: number; x: number; y: number };
  current: { time: UTCTimestamp; price: number; x: number; y: number };
}

interface DragState {
  drawingId: string;
  handle: 'start' | 'end' | 'whole';
  origin: TrendLineDrawing;
  startX: number;
  startY: number;
}

export function useDrawingTools(opts: UseDrawingToolsOptions): void {
  const {
    chart,
    series,
    containerEl,
    chartId,
    drawings,
    toolMode,
    palette,
    onAddTrendLine,
    onUpdateTrendLine,
    onFinish,
  } = opts;

  const primitivesRef = useRef<Map<string, TrendLinePrimitive>>(new Map());
  const draftPrimitiveRef = useRef<TrendLinePrimitive | null>(null);
  const [, forceUpdate] = useState(0);
  const draftRef = useRef<DraftState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const lastSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);

  useEffect(() => {
    if (!series) {
      return;
    }
    if (lastSeriesRef.current !== series) {
      primitivesRef.current.clear();
      if (draftPrimitiveRef.current) {
        draftPrimitiveRef.current = null;
      }
      lastSeriesRef.current = series;
    }
    const map = primitivesRef.current;
    const desired = new Map<string, TrendLineDrawing>();
    drawings
      .filter((d) => d.chartId === chartId)
      .forEach((d) => desired.set(d.id, d));

    map.forEach((prim, id) => {
      if (!desired.has(id)) {
        try {
          series.detachPrimitive(prim);
        } catch {
          // ignore
        }
        map.delete(id);
      }
    });

    desired.forEach((d, id) => {
      const existing = map.get(id);
      if (existing) {
        existing.setData(d);
      } else {
        const prim = new TrendLinePrimitive(d);
        series.attachPrimitive(prim);
        map.set(id, prim);
      }
    });
  }, [series, drawings, chartId]);

  useEffect(() => {
    if (!containerEl || !chart || !series) {
      return undefined;
    }

    const coordToTimePrice = (
      x: number,
      y: number,
    ): { time: UTCTimestamp; price: number } | null => {
      const t = chart.timeScale().coordinateToTime(x);
      const p = series.coordinateToPrice(y);
      if (t === null || p === null) {
        return null;
      }
      return { time: t as UTCTimestamp, price: Number(p) };
    };

    const renderDraft = (): void => {
      const draft = draftRef.current;
      if (!draft) {
        if (draftPrimitiveRef.current) {
          try {
            series.detachPrimitive(draftPrimitiveRef.current);
          } catch {
            // ignore
          }
          draftPrimitiveRef.current = null;
          forceUpdate((n) => n + 1);
        }
        return;
      }
      const data: TrendLineDrawing = {
        id: '__draft__',
        chartId,
        kind: 'trendline',
        start: { time: draft.start.time, price: draft.start.price },
        end: { time: draft.current.time, price: draft.current.price },
        color: palette.accent,
        width: 1,
      };
      if (!draftPrimitiveRef.current) {
        const prim = new TrendLinePrimitive(data);
        series.attachPrimitive(prim);
        draftPrimitiveRef.current = prim;
      } else {
        draftPrimitiveRef.current.setData(data);
      }
      chart
        .timeScale()
        .applyOptions({ rightOffset: chart.timeScale().options().rightOffset });
    };

    const onMouseDown = (ev: MouseEvent): void => {
      if (ev.button !== 0) {
        return;
      }
      const rect = containerEl.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      if (toolMode === 'trendline') {
        const tp = coordToTimePrice(x, y);
        if (!tp) {
          return;
        }
        if (!draftRef.current) {
          draftRef.current = {
            start: { ...tp, x, y },
            current: { ...tp, x, y },
          };
          renderDraft();
        }
        return;
      }
      const hit = hitTestDrawings(primitivesRef.current, x, y);
      if (hit) {
        const prim = primitivesRef.current.get(hit.id);
        if (prim) {
          dragRef.current = {
            drawingId: hit.id,
            handle: hit.isHandle && hit.whichHandle ? hit.whichHandle : 'whole',
            origin: { ...prim.data() },
            startX: x,
            startY: y,
          };
          prim.setSelected(true);
          chart
            .timeScale()
            .applyOptions({ rightOffset: chart.timeScale().options().rightOffset });
        }
      }
    };

    const onMouseMove = (ev: MouseEvent): void => {
      const rect = containerEl.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      if (draftRef.current) {
        const tp = coordToTimePrice(x, y);
        if (tp) {
          draftRef.current = {
            start: draftRef.current.start,
            current: { ...tp, x, y },
          };
          renderDraft();
        }
        return;
      }

      const drag = dragRef.current;
      if (drag) {
        const prim = primitivesRef.current.get(drag.drawingId);
        if (!prim) {
          return;
        }
        if (drag.handle === 'start' || drag.handle === 'end') {
          const tp = coordToTimePrice(x, y);
          if (!tp) {
            return;
          }
          const next: TrendLineDrawing = { ...drag.origin };
          if (drag.handle === 'start') {
            next.start = { time: tp.time, price: tp.price };
          } else {
            next.end = { time: tp.time, price: tp.price };
          }
          prim.setData(next);
        } else {
          const tpNow = coordToTimePrice(x, y);
          const tpStart = coordToTimePrice(drag.startX, drag.startY);
          if (!tpNow || !tpStart) {
            return;
          }
          const dt = (tpNow.time as number) - (tpStart.time as number);
          const dp = tpNow.price - tpStart.price;
          const next: TrendLineDrawing = {
            ...drag.origin,
            start: {
              time: ((drag.origin.start.time as number) + dt) as UTCTimestamp,
              price: drag.origin.start.price + dp,
            },
            end: {
              time: ((drag.origin.end.time as number) + dt) as UTCTimestamp,
              price: drag.origin.end.price + dp,
            },
          };
          prim.setData(next);
        }
      }
    };

    const onMouseUp = (ev: MouseEvent): void => {
      const rect = containerEl.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      if (draftRef.current) {
        const start = draftRef.current.start;
        const tp = coordToTimePrice(x, y);
        draftRef.current = null;
        if (tp) {
          const id = `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const drawing: TrendLineDrawing = {
            id,
            chartId,
            kind: 'trendline',
            start: { time: start.time, price: start.price },
            end: { time: tp.time, price: tp.price },
            color: palette.accent,
            width: 2,
          };
          if (draftPrimitiveRef.current) {
            try {
              series.detachPrimitive(draftPrimitiveRef.current);
            } catch {
              // ignore
            }
            draftPrimitiveRef.current = null;
          }
          onAddTrendLine(drawing);
          onFinish();
        } else {
          if (draftPrimitiveRef.current) {
            try {
              series.detachPrimitive(draftPrimitiveRef.current);
            } catch {
              // ignore
            }
            draftPrimitiveRef.current = null;
          }
        }
        return;
      }

      const drag = dragRef.current;
      if (drag) {
        const prim = primitivesRef.current.get(drag.drawingId);
        if (prim) {
          onUpdateTrendLine(prim.data());
          prim.setSelected(false);
        }
        dragRef.current = null;
      }
    };

    containerEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      containerEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [
    chart,
    series,
    containerEl,
    chartId,
    toolMode,
    palette,
    onAddTrendLine,
    onUpdateTrendLine,
    onFinish,
  ]);

  useEffect(() => {
    return () => {
      const draft = draftPrimitiveRef.current;
      const s = opts.series;
      if (draft && s) {
        try {
          s.detachPrimitive(draft);
        } catch {
          // ignore
        }
      }
      draftPrimitiveRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function hitTestDrawings(
  map: Map<string, TrendLinePrimitive>,
  x: number,
  y: number,
): { id: string; isHandle: boolean; whichHandle?: 'start' | 'end' } | null {
  let best: { id: string; isHandle: boolean; whichHandle?: 'start' | 'end' } | null = null;
  map.forEach((p) => {
    const hit = p.hitTestDrawing(x, y);
    if (hit) {
      if (!best || (hit.isHandle && !best.isHandle)) {
        best = hit;
      }
    }
  });
  return best;
}
