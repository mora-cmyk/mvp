import type {
  IChartApi,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesType,
  Time,
} from 'lightweight-charts';
import type { TrendLineDrawing } from '../../../types/drawing';

class TrendLineRenderer implements IPrimitivePaneRenderer {
  private readonly p1: { x: number; y: number } | null;
  private readonly p2: { x: number; y: number } | null;
  private readonly color: string;
  private readonly width: number;
  private readonly showHandles: boolean;

  constructor(
    p1: { x: number; y: number } | null,
    p2: { x: number; y: number } | null,
    color: string,
    width: number,
    showHandles: boolean,
  ) {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;
    this.width = width;
    this.showHandles = showHandles;
  }

  draw(target: {
    useBitmapCoordinateSpace: (
      cb: (scope: {
        context: CanvasRenderingContext2D;
        horizontalPixelRatio: number;
        verticalPixelRatio: number;
      }) => void,
    ) => void;
  }): void {
    if (!this.p1 || !this.p2) {
      return;
    }
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } =
        scope;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.width * vpr;
      ctx.moveTo(this.p1!.x * hpr, this.p1!.y * vpr);
      ctx.lineTo(this.p2!.x * hpr, this.p2!.y * vpr);
      ctx.stroke();
      if (this.showHandles) {
        ctx.fillStyle = this.color;
        const r = 4 * vpr;
        [this.p1!, this.p2!].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x * hpr, p.y * vpr, r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    });
  }
}

class TrendLinePaneView implements IPrimitivePaneView {
  private p1: { x: number; y: number } | null = null;
  private p2: { x: number; y: number } | null = null;

  constructor(private readonly source: TrendLinePrimitive) {}

  update(): void {
    const data = this.source.data();
    const chart = this.source.chart();
    const series = this.source.series();
    if (!chart || !series) {
      this.p1 = null;
      this.p2 = null;
      return;
    }
    const ts = chart.timeScale();
    const x1 = ts.timeToCoordinate(data.start.time as Time);
    const x2 = ts.timeToCoordinate(data.end.time as Time);
    const y1 = series.priceToCoordinate(data.start.price);
    const y2 = series.priceToCoordinate(data.end.price);
    if (x1 === null || x2 === null || y1 === null || y2 === null) {
      this.p1 = null;
      this.p2 = null;
      return;
    }
    this.p1 = { x: x1, y: y1 };
    this.p2 = { x: x2, y: y2 };
  }

  renderer(): IPrimitivePaneRenderer {
    const data = this.source.data();
    return new TrendLineRenderer(
      this.p1,
      this.p2,
      data.color,
      data.width,
      this.source.isSelected(),
    );
  }
}

export class TrendLinePrimitive implements ISeriesPrimitive<Time> {
  private _data: TrendLineDrawing;
  private _chart: IChartApi | null = null;
  private _series: ISeriesApi<SeriesType> | null = null;
  private _view: TrendLinePaneView;
  private _selected: boolean = false;

  constructor(data: TrendLineDrawing) {
    this._data = data;
    this._view = new TrendLinePaneView(this);
  }

  data(): TrendLineDrawing {
    return this._data;
  }

  setData(data: TrendLineDrawing): void {
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

  hitTestDrawing(
    x: number,
    y: number,
  ): { id: string; isHandle: boolean; whichHandle?: 'start' | 'end' } | null {
    const chart = this._chart;
    const series = this._series;
    if (!chart || !series) {
      return null;
    }
    const ts = chart.timeScale();
    const x1 = ts.timeToCoordinate(this._data.start.time as Time);
    const x2 = ts.timeToCoordinate(this._data.end.time as Time);
    const y1 = series.priceToCoordinate(this._data.start.price);
    const y2 = series.priceToCoordinate(this._data.end.price);
    if (x1 === null || x2 === null || y1 === null || y2 === null) {
      return null;
    }
    if (Math.hypot(x - x1, y - y1) <= 8) {
      return { id: this._data.id, isHandle: true, whichHandle: 'start' };
    }
    if (Math.hypot(x - x2, y - y2) <= 8) {
      return { id: this._data.id, isHandle: true, whichHandle: 'end' };
    }
    const dist = distancePointToSegment(x, y, x1, y1, x2, y2);
    if (dist <= 6) {
      return { id: this._data.id, isHandle: false };
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
