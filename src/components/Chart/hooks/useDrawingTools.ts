import { useEffect, useRef, useState } from 'react';
import type {
  IChartApi,
  ISeriesApi,
  SeriesType,
  UTCTimestamp,
} from 'lightweight-charts';
import {
  pointsForKind,
  type DrawingPoint,
  type DrawingShape,
  type ToolMode,
} from '../../../types/drawing';
import type { ThemePalette } from '../utils/themePresets';
import { DrawingPrimitive, type DrawingHit } from '../drawings/DrawingPrimitive';

interface UseDrawingToolsOptions {
  chart: IChartApi | null;
  series: ISeriesApi<SeriesType> | null;
  containerEl: HTMLElement | null;
  chartId: string;
  drawings: DrawingShape[];
  toolMode: ToolMode;
  palette: ThemePalette;
  onAddDrawing: (d: DrawingShape) => void;
  onUpdateDrawing: (d: DrawingShape) => void;
  onFinish: () => void;
}

interface DraftState {
  kind: Exclude<ToolMode, 'none'>;
  start: DrawingPoint;
  current: DrawingPoint;
}

interface DragState {
  drawingId: string;
  handleIdx: number | 'whole';
  origin: DrawingShape;
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
    onAddDrawing,
    onUpdateDrawing,
    onFinish,
  } = opts;

  const primitivesRef = useRef<Map<string, DrawingPrimitive>>(new Map());
  const draftPrimitiveRef = useRef<DrawingPrimitive | null>(null);
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
    const desired = new Map<string, DrawingShape>();
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
        const prim = new DrawingPrimitive(d);
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
    ): DrawingPoint | null => {
      const t = chart.timeScale().coordinateToTime(x);
      const p = series.coordinateToPrice(y);
      if (t === null || p === null) {
        return null;
      }
      return { time: t as UTCTimestamp, price: Number(p) };
    };

    const detachDraft = (): void => {
      if (draftPrimitiveRef.current) {
        try {
          series.detachPrimitive(draftPrimitiveRef.current);
        } catch {
          // ignore
        }
        draftPrimitiveRef.current = null;
        forceUpdate((n) => n + 1);
      }
    };

    const renderDraft = (): void => {
      const draft = draftRef.current;
      if (!draft) {
        detachDraft();
        return;
      }
      const pts = pointsForKind(draft.kind);
      const data: DrawingShape = {
        id: '__draft__',
        chartId,
        kind: draft.kind,
        points:
          pts === 1
            ? [draft.start]
            : [draft.start, draft.current],
        color: palette.accent,
        width: 1,
      };
      if (!draftPrimitiveRef.current) {
        const prim = new DrawingPrimitive(data);
        series.attachPrimitive(prim);
        draftPrimitiveRef.current = prim;
      } else {
        draftPrimitiveRef.current.setData(data);
      }
      chart
        .timeScale()
        .applyOptions({ rightOffset: chart.timeScale().options().rightOffset });
    };

    const commitDrawing = (kind: Exclude<ToolMode, 'none'>, points: DrawingPoint[]): void => {
      const id = `dr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const drawing: DrawingShape = {
        id,
        chartId,
        kind,
        points,
        color: palette.accent,
        width: 2,
      };
      detachDraft();
      onAddDrawing(drawing);
      onFinish();
    };

    const onMouseDown = (ev: MouseEvent): void => {
      if (ev.button !== 0) {
        return;
      }
      const rect = containerEl.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      if (toolMode !== 'none') {
        const tp = coordToTimePrice(x, y);
        if (!tp) {
          return;
        }
        const needed = pointsForKind(toolMode);
        if (needed === 1) {
          commitDrawing(toolMode, [tp]);
          return;
        }
        if (!draftRef.current) {
          draftRef.current = {
            kind: toolMode,
            start: tp,
            current: tp,
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
            handleIdx: hit.isHandle && hit.whichHandle !== undefined ? hit.whichHandle : 'whole',
            origin: {
              ...prim.data(),
              points: prim.data().points.map((p) => ({ ...p })),
            },
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
            kind: draftRef.current.kind,
            start: draftRef.current.start,
            current: tp,
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
        if (typeof drag.handleIdx === 'number') {
          const tp = coordToTimePrice(x, y);
          if (!tp) {
            return;
          }
          const next: DrawingShape = {
            ...drag.origin,
            points: drag.origin.points.map((p, i) =>
              i === drag.handleIdx ? tp : p,
            ),
          };
          prim.setData(next);
        } else {
          const tpNow = coordToTimePrice(x, y);
          const tpStart = coordToTimePrice(drag.startX, drag.startY);
          if (!tpNow || !tpStart) {
            return;
          }
          const dt = (tpNow.time as number) - (tpStart.time as number);
          const dp = tpNow.price - tpStart.price;
          const next: DrawingShape = {
            ...drag.origin,
            points: drag.origin.points.map((p) => ({
              time: ((p.time as number) + dt) as UTCTimestamp,
              price: p.price + dp,
            })),
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
        const draft = draftRef.current;
        const tp = coordToTimePrice(x, y);
        draftRef.current = null;
        if (tp) {
          const distancePx = Math.hypot(x - rect.width / 2, y - rect.height / 2);
          if (
            (tp.time as number) === (draft.start.time as number) &&
            tp.price === draft.start.price &&
            distancePx === 0
          ) {
            detachDraft();
            return;
          }
          commitDrawing(draft.kind, [draft.start, tp]);
        } else {
          detachDraft();
        }
        return;
      }

      const drag = dragRef.current;
      if (drag) {
        const prim = primitivesRef.current.get(drag.drawingId);
        if (prim) {
          onUpdateDrawing(prim.data());
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
    onAddDrawing,
    onUpdateDrawing,
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
  map: Map<string, DrawingPrimitive>,
  x: number,
  y: number,
): DrawingHit | null {
  let best: DrawingHit | null = null;
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
