import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';

export interface RegisteredChart {
  cellId: string;
  chart: IChartApi;
  series: ISeriesApi<SeriesType>;
}

type Listener = (charts: RegisteredChart[]) => void;

const registry: Map<string, RegisteredChart> = new Map();
const listeners: Set<Listener> = new Set();

function notify(): void {
  const all = Array.from(registry.values());
  listeners.forEach((l) => l(all));
}

export function registerChart(entry: RegisteredChart): void {
  registry.set(entry.cellId, entry);
  notify();
}

export function unregisterChart(cellId: string): void {
  if (registry.delete(cellId)) {
    notify();
  }
}

export function subscribeRegistry(listener: Listener): () => void {
  listeners.add(listener);
  listener(Array.from(registry.values()));
  return () => {
    listeners.delete(listener);
  };
}
