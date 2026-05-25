import type {
  IChartApi,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesType,
  Time,
} from 'lightweight-charts';
import { FIB_LEVELS, type DrawingShape } from '../../../types/drawing';

const FIB_COLORS: string[] = [
  '#9aa0a6',
  '#ef5350',
  '#ff9800',
  '#fdd835',
  '#26a69a',
  '#42a5f5',
  '#ab47bc',
];

type Pt = { x: number; y: number };

interface DrawCtx {
  context: CanvasRenderingContext2D;
  horizontalPixelRatio: number;
  verticalPixelRatio: number;
  bitmapSize: { width: number; height: number };
}

class DrawingRenderer implements IPrimitivePaneRenderer {
  constructor(
    private readonly shape: DrawingShape,
    private readonly screenPts: Pt[],
    private readonly showHandles: boolean,
  ) {}

  draw(target: {
    useBitmapCoordinateSpace: (cb: (scope: DrawCtx) => void) => void;
  }): void {
    if (this.screenPts.some((p) => !p)) {
      return;
    }
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } =
        scope;
      const w = scope.bitmapSize.width;
      const h = scope.bitmapSize.height;
      const pts = this.screenPts.map((p) => ({
        x: p.x * hpr,
        y: p.y * vpr,
      }));
      ctx.save();
      ctx.strokeStyle = this.shape.color;
      ctx.fillStyle = this.shape.color;
      ctx.lineWidth = this.shape.width * vpr;
      ctx.font = `${10 * vpr}px sans-serif`;

      switch (this.shape.kind) {
        case 'trendline':
          if (pts.length >= 2) {
            line(ctx, pts[0], pts[1]);
          }
          break;
        case 'horizontal':
          if (pts.length >= 1) {
            line(ctx, { x: 0, y: pts[0].y }, { x: w, y: pts[0].y });
          }
          break;
        case 'vertical':
          if (pts.length >= 1) {
            line(ctx, { x: pts[0].x, y: 0 }, { x: pts[0].x, y: h });
          }
          break;
        case 'ray':
          if (pts.length >= 2) {
            const ext = extendRay(pts[0], pts[1], w, h);
            line(ctx, pts[0], ext);
          }
          break;
        case 'rectangle':
          if (pts.length >= 2) {
            const x = Math.min(pts[0].x, pts[1].x);
            const y = Math.min(pts[0].y, pts[1].y);
            const rw = Math.abs(pts[0].x - pts[1].x);
            const rh = Math.abs(pts[0].y - pts[1].y);
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillRect(x, y, rw, rh);
            ctx.restore();
            ctx.strokeRect(x, y, rw, rh);
          }
          break;
        case 'fibonacci':
          if (pts.length >= 2) {
            const top = pts[0];
            const bot = pts[1];
            FIB_LEVELS.forEach((lv) => {
              const y = top.y + (bot.y - top.y) * lv;
              ctx.save();
              ctx.globalAlpha = 0.85;
              line(ctx, { x: 0, y }, { x: w, y });
              ctx.fillText(`${lv.toFixed(3)}`, 4 * hpr, y - 2 * vpr);
              ctx.restore();
            });
          }
          break;
        case 'fibFan':
          if (pts.length >= 2) {
            const a = pts[0];
            const b = pts[1];
            const dy = b.y - a.y;
            const ends = FIB_LEVELS.map((lv, idx) => ({
              lv,
              color: FIB_COLORS[idx % FIB_COLORS.length],
              end: extendRay(a, { x: b.x, y: a.y + dy * lv }, w, h),
            }));
            for (let i = 0; i < ends.length - 1; i += 1) {
              ctx.save();
              ctx.globalAlpha = 0.14;
              ctx.fillStyle = ends[i].color;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(ends[i].end.x, ends[i].end.y);
              ctx.lineTo(ends[i + 1].end.x, ends[i + 1].end.y);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
            ends.forEach(({ lv, end, color }) => {
              ctx.save();
              ctx.globalAlpha = 0.95;
              ctx.strokeStyle = color;
              ctx.fillStyle = color;
              line(ctx, a, end);
              ctx.fillText(`${lv.toFixed(3)}`, end.x + 4 * hpr, end.y);
              ctx.restore();
            });
          }
          break;
        case 'channel':
          if (pts.length >= 2) {
            const a = pts[0];
            const b = pts[1];
            const offsetPx = Math.max(40 * vpr, Math.abs(b.y - a.y) * 0.5);
            line(ctx, a, b);
            line(
              ctx,
              { x: a.x, y: a.y - offsetPx },
              { x: b.x, y: b.y - offsetPx },
            );
            line(
              ctx,
              { x: a.x, y: a.y + offsetPx },
              { x: b.x, y: b.y + offsetPx },
            );
          }
          break;
      }

      if (this.showHandles) {
        const r = 4 * vpr;
        pts.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    });
  }
}

function line(ctx: CanvasRenderingContext2D, p1: Pt, p2: Pt): void {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function extendRay(a: Pt, b: Pt, w: number, h: number): Pt {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) {
    return b;
  }
  const candidates: number[] = [];
  if (dx !== 0) {
    candidates.push((0 - a.x) / dx);
    candidates.push((w - a.x) / dx);
  }
  if (dy !== 0) {
    candidates.push((0 - a.y) / dy);
    candidates.push((h - a.y) / dy);
  }
  const positives = candidates.filter((t) => t > 0);
  if (positives.length === 0) {
    return b;
  }
  const t = Math.min(...positives);
  return { x: a.x + dx * t, y: a.y + dy * t };
}

class DrawingPaneView implements IPrimitivePaneView {
  private screen: Pt[] = [];

  constructor(private readonly source: DrawingPrimitive) {}

  update(): void {
    const data = this.source.data();
    const chart = this.source.chart();
    const series = this.source.series();
    if (!chart || !series) {
      this.screen = [];
      return;
    }
    const ts = chart.timeScale();
    const next: Pt[] = [];
    for (const pt of data.points) {
      const x = ts.timeToCoordinate(pt.time as Time);
      const y = series.priceToCoordinate(pt.price);
      if (x === null || y === null) {
        this.screen = [];
        return;
      }
      next.push({ x, y });
    }
    this.screen = next;
  }

  renderer(): IPrimitivePaneRenderer {
    return new DrawingRenderer(
      this.source.data(),
      this.screen,
      this.source.isSelected(),
    );
  }

  screenPoints(): Pt[] {
    return this.screen;
  }
}

export interface DrawingHit {
  id: string;
  isHandle: boolean;
  whichHandle?: number;
}

export class DrawingPrimitive implements ISeriesPrimitive<Time> {
  private _data: DrawingShape;
  private _chart: IChartApi | null = null;
  private _series: ISeriesApi<SeriesType> | null = null;
  private _view: DrawingPaneView;
  private _selected = false;

  constructor(data: DrawingShape) {
    this._data = data;
    this._view = new DrawingPaneView(this);
  }

  data(): DrawingShape {
    return this._data;
  }

  setData(data: DrawingShape): void {
    this._data = data;
    this._view.update();
  }

  setSelected(selected: boolean): void {
    this._selected = selected;
  }

  isSelected(): boolean {
    return this._selected;
  }

  attached({
    chart,
    series,
  }: {
    chart: IChartApi;
    series: ISeriesApi<SeriesType>;
  }): void {
    this._chart = chart;
    this._series = series;
    this._view.update();
  }

  detached(): void {
    this._chart = null;
    this._series = null;
  }

  chart(): IChartApi | null {
    return this._chart;
  }

  series(): ISeriesApi<SeriesType> | null {
    return this._series;
  }

  updateAllViews(): void {
    this._view.update();
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [this._view];
  }

  hitTestDrawing(x: number, y: number): DrawingHit | null {
    const pts = this._view.screenPoints();
    if (pts.length === 0) {
      return null;
    }
    for (let i = 0; i < pts.length; i += 1) {
      if (Math.hypot(x - pts[i].x, y - pts[i].y) <= 8) {
        return { id: this._data.id, isHandle: true, whichHandle: i };
      }
    }
    const kind = this._data.kind;
    if (kind === 'horizontal') {
      if (Math.abs(y - pts[0].y) <= 6) {
        return { id: this._data.id, isHandle: false };
      }
      return null;
    }
    if (kind === 'vertical') {
      if (Math.abs(x - pts[0].x) <= 6) {
        return { id: this._data.id, isHandle: false };
      }
      return null;
    }
    if (kind === 'rectangle' && pts.length >= 2) {
      const xa = Math.min(pts[0].x, pts[1].x);
      const xb = Math.max(pts[0].x, pts[1].x);
      const ya = Math.min(pts[0].y, pts[1].y);
      const yb = Math.max(pts[0].y, pts[1].y);
      const nearEdge =
        (x >= xa - 4 && x <= xb + 4 && (Math.abs(y - ya) <= 4 || Math.abs(y - yb) <= 4)) ||
        (y >= ya - 4 && y <= yb + 4 && (Math.abs(x - xa) <= 4 || Math.abs(x - xb) <= 4));
      if (nearEdge) {
        return { id: this._data.id, isHandle: false };
      }
      return null;
    }
    if (pts.length >= 2) {
      const dist = distancePointToSegment(x, y, pts[0].x, pts[0].y, pts[1].x, pts[1].y);
      if (dist <= 6) {
        return { id: this._data.id, isHandle: false };
      }
    }
    return null;
  }
}

function distancePointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(px - ax, py - ay);
  }
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}
