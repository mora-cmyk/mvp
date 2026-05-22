# Lightweight Charts Trading MVP

A React + TypeScript demo of a TradingView Lightweight Charts v5 powered chart for a trading platform.

## Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173/`.

Other commands:

- `npm run typecheck` — strict TypeScript check (no emit)
- `npm run build` — production build (runs `tsc -b` + `vite build`)
- `npm run preview` — preview production build

## Stack

- Vite + React 18 + TypeScript 5 (strict)
- `lightweight-charts` v5.x — only public APIs (`addSeries`, `attachPrimitive`, `createSeriesMarkers`, `createPriceLine`, `panes`, `takeScreenshot`, etc.)
- `@reduxjs/toolkit` + `react-redux`
- CSS Modules

No barrel files. No default exports. No `any`/`unknown`. No `@ts-ignore`. No inline styles (CSS variables only). Each component lives in its own folder.

## What works

### Must-have features (all implemented)

1. **Chart types** — Candlestick, Bar, Line, Area, Baseline, Hollow Candle (per-bar color override).
2. **Mock streaming** — 500 candles per instrument, deterministic per `(symbol, timeframe)` seed; a tick is generated every second to update the last candle, or roll a new one when the timeframe boundary passes.
3. **Toolbar** — instrument picker (3 mock instruments), chart-type, timeframe, indicators, drawings, scale mode, crosshair/volume/orders/trades toggles, screenshot, theme.
4. **Timeframes** — `1m / 2m / 3m / 5m / 10m / 15m / 30m / 1h / 4h / 6h / 1d / 1w / 1M` + custom (number + unit).
5. **Themes** — Light, Dark, Grey, applied via `applyOptions` on the chart and CSS variables on the rest of the UI.
6. **Indicators** — SMA, EMA, Bollinger Bands (overlay on price pane); RSI and MACD in their own panes via `paneIndex`. All math implemented locally. Add/remove with parameter UI (period, stdDev, fast/slow/signal).
7. **Crosshair + OHLCV tooltip** — overlay div positioned from `subscribeCrosshairMove`. Toggleable.
8. **Scale modes** — Normal, Log, Percentage via `priceScale.applyOptions({ mode })`.
9. **Manual vertical scaling** — built-in LWC drag-on-axis (default).
10. **Screenshot** — copies the chart's canvas to a downloaded PNG.
11. **Multi-chart layouts** — Single, Double Horizontal, Double Vertical, Triple, Quadruple. **Crosshair sync** between charts via `setCrosshairPosition` + `clearCrosshairPosition`. **Visible range sync** via `subscribeVisibleLogicalRangeChange` + `setVisibleLogicalRange`.

### Should-have features

12. **Orders & alerts on chart** — `createPriceLine` with labels; mock orders in Redux, toggleable.
13. **Trade markers** — `createSeriesMarkers` plugin draws arrowUp/arrowDown markers on historical bars from mock trade specs.
14. **Drag-and-drop instruments** — chip-style drag handles in the toolbar drop onto any chart cell to swap the loaded instrument.
15. **Right-click context menu** — Add buy order at price, Add sell order at price, Add alert at price, Reset zoom.
16. **Trend Line drawing tool** — `ISeriesPrimitive` with a 2-point line, draft preview while drawing, hit testing (distance-to-segment + handle radius), drag-to-move (whole line) or drag-handles (per-endpoint). State serialized in Redux per chart cell.
17. **Duplicate chart** — button on each non-single cell clones cell state (instrument, type, TF, indicators, settings, overlay) into a new cell within the same layout.
18. **Overlay instrument** — secondary line series on a separate price scale (`priceScaleId: 'overlay_scale'`) so two instruments share the chart with independent axes.

## What's skipped

19. **Interactive order dragging** — orders are shown with `createPriceLine` (label visible on the axis). LWC's built-in price line API doesn't expose a draggable handle, and implementing it would require a full custom primitive with hit-testing, hover state, and price-axis label rendering. Skipped to keep within scope.
20. **Corporate actions (splits / dividends)** — the marker plugin is wired, but no mock event stream is generated. Adding it would be ~30 minutes of mock work plus tooltip styling — left as future work.
21. **Last-candle animation** — streaming updates the last candle every second, but there's no easing animation on the price change. LWC doesn't expose tween hooks; a custom one would require a primitive draw loop.

## Project layout

```
src/
  app/           App.tsx, store.ts (RTK), App.module.css
  components/
    Chart/
      Chart.tsx, Chart.module.css
      hooks/      one hook per file
      utils/      themes, constants, generators, formatters
      indicators/ pure math (sma, ema, bb, rsi, macd)
      drawings/   TrendLinePrimitive
      ChartTooltip/, ChartContextMenu/
    ChartHeader/  one file per toolbar group
    MultiChart/   MultiChart.tsx, LayoutSelector.tsx, hooks/useChartSync.ts, chartRegistry.ts
  store/         chartSlice.ts, ordersSlice.ts, drawingsSlice.ts, *Types.ts
  mocks/         instruments, orders, trade specs
  types/         chart, indicator, drawing, order
  main.tsx, main.css
```

## Known limitations

- React StrictMode is on. The chart instance hook detaches and re-creates on the second invocation in dev — handled by stable `useCallback` for the container ref and try/catch on detaches.
- Switching chart type recreates the primary series. Hooks that own per-series plugins (`useTradeMarkers`, `useDrawingTools`) detect the series identity change and rebuild attachments on the new series.
- Custom timeframes regenerate mock candles client-side; no persistence across reload.
- Trend lines can be dragged; they don't currently snap to bars (free time/price coordinates).
- Quadruple layout disables the per-cell **Duplicate** button.

## Conventions

- No barrel/`index.ts` files; explicit imports only.
- Only named exports.
- All component-local styles via CSS Modules (`import Styles from './X.module.css'`).
- Concrete prop interfaces declared next to each component — no inline structural types.
- All chart series created via `chart.addSeries(SeriesDefinition, options, paneIndex?)` — the v5 API.
