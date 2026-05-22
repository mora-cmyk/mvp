import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { MOCK_INSTRUMENTS } from '../../mocks/instruments';
import { chartActions } from '../../store/chartSlice';
import { drawingsActions } from '../../store/drawingsSlice';
import { ordersActions } from '../../store/ordersSlice';
import type { ChartCellState } from '../../store/chartTypes';
import type { TrendLineDrawing } from '../../types/drawing';
import { ChartContextMenu } from './ChartContextMenu/ChartContextMenu';
import { ChartTooltip } from './ChartTooltip/ChartTooltip';
import { useChartData } from './hooks/useChartData';
import { useChartInstance } from './hooks/useChartInstance';
import { useContextMenu } from './hooks/useContextMenu';
import { useCrosshairTooltip } from './hooks/useCrosshairTooltip';
import { useDrawingTools } from './hooks/useDrawingTools';
import { useIndicators } from './hooks/useIndicators';
import { useOrdersOnChart } from './hooks/useOrdersOnChart';
import { usePriceSeries } from './hooks/usePriceSeries';
import { useTradeMarkers } from './hooks/useTradeMarkers';
import { useOverlaySeries } from './hooks/useOverlaySeries';
import {
  registerChart,
  unregisterChart,
} from '../MultiChart/chartRegistry';
import ChartStyles from './Chart.module.css';

interface ChartProps {
  cell: ChartCellState;
  drawingMode: 'none' | 'trendline';
  onDrawingFinished: () => void;
}

export function Chart(props: ChartProps) {
  const { cell, drawingMode, onDrawingFinished } = props;
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.chart.theme);
  const activeCellId = useAppSelector((s) => s.chart.activeCellId);
  const layout = useAppSelector((s) => s.chart.layout);
  const orders = useAppSelector(
    (s) => s.orders.orders.filter((o) => o.instrumentId === cell.instrumentId),
    shallowEqual,
  );
  const alerts = useAppSelector(
    (s) => s.orders.alerts.filter((a) => a.instrumentId === cell.instrumentId),
    shallowEqual,
  );
  const tradeSpecs = useAppSelector((s) => s.orders.tradeSpecs);
  const trendLines = useAppSelector(
    (s) => s.drawings.trendLines.filter((d) => d.chartId === cell.id),
    shallowEqual,
  );

  const instrument = useMemo(
    () =>
      MOCK_INSTRUMENTS.find((i) => i.id === cell.instrumentId) ??
      MOCK_INSTRUMENTS[0],
    [cell.instrumentId],
  );

  const { containerRef, chart, palette } = useChartInstance(theme);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const update = (): void => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { candles, lastTick } = useChartData({
    instrumentId: cell.instrumentId,
    timeframe: cell.customTimeframe,
    streaming: true,
  });

  const { priceSeries } = usePriceSeries({
    chart,
    chartType: cell.chartType,
    candles,
    lastTick,
    palette,
    showVolume: cell.showVolume,
    scaleMode: cell.scaleMode,
  });

  useIndicators({ chart, candles, indicators: cell.indicators, palette });

  useOverlaySeries({
    chart,
    palette,
    overlayInstrumentId: cell.overlayInstrumentId,
    timeframe: cell.customTimeframe,
  });

  useOrdersOnChart({
    series: priceSeries,
    orders,
    alerts,
    palette,
    visible: cell.showOrders,
  });

  useTradeMarkers({
    series: priceSeries,
    candles,
    tradeSpecs,
    palette,
    visible: cell.showTrades,
  });

  const tooltipState = useCrosshairTooltip({
    chart,
    series: priceSeries,
    candles,
    enabled: cell.showCrosshair,
  });

  const { state: menuState, close: closeMenu } = useContextMenu({
    containerEl,
    chart,
    series: priceSeries,
  });

  useEffect(() => {
    if (!chart || !priceSeries) {
      return undefined;
    }
    registerChart({ cellId: cell.id, chart, series: priceSeries });
    return () => unregisterChart(cell.id);
  }, [chart, priceSeries, cell.id]);

  useDrawingTools({
    chart,
    series: priceSeries,
    containerEl,
    chartId: cell.id,
    drawings: trendLines,
    toolMode: drawingMode,
    palette,
    onAddTrendLine: (d: TrendLineDrawing) => {
      dispatch(drawingsActions.addTrendLine(d));
    },
    onUpdateTrendLine: (d: TrendLineDrawing) => {
      dispatch(drawingsActions.updateTrendLine(d));
    },
    onFinish: onDrawingFinished,
  });

  const mergedCanvasRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef(node);
      setContainerEl(node);
    },
    [containerRef],
  );

  const cssVars: CSSProperties = {
    ['--chart-bg' as string]: palette.background,
    ['--chart-border' as string]: palette.border,
    ['--chart-text' as string]: palette.text,
    ['--chart-accent' as string]: palette.accent,
  };

  const isActive = activeCellId === cell.id && layout !== 'single';
  const canDuplicate = layout !== 'single' && layout !== 'quadruple';

  return (
    <div
      ref={(n) => {
        rootRef.current = n;
      }}
      className={`${ChartStyles.root} ${isActive ? ChartStyles.active : ''}`}
      style={cssVars}
      onClick={() => {
        if (activeCellId !== cell.id) {
          dispatch(chartActions.setActiveCell(cell.id));
        }
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('text/x-instrument-id')) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        const id = e.dataTransfer.getData('text/x-instrument-id');
        setDragOver(false);
        if (id && MOCK_INSTRUMENTS.some((i) => i.id === id)) {
          e.preventDefault();
          dispatch(
            chartActions.setInstrument({ cellId: cell.id, instrumentId: id }),
          );
        }
      }}
    >
      <div className={ChartStyles.cellLabel}>{instrument.symbol}</div>
      {canDuplicate && (
        <button
          type="button"
          className={ChartStyles.duplicateBtn}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(chartActions.duplicateCell({ cellId: cell.id }));
          }}
        >
          Duplicate
        </button>
      )}
      <div ref={mergedCanvasRef} className={ChartStyles.canvas} />
      <ChartTooltip
        state={tooltipState}
        palette={palette}
        containerWidth={size.width}
        containerHeight={size.height}
      />
      <ChartContextMenu
        state={menuState}
        palette={palette}
        onAddBuyOrder={(price) =>
          dispatch(
            ordersActions.addOrder({
              instrumentId: cell.instrumentId,
              price,
              side: 'buy',
              quantity: 100,
            }),
          )
        }
        onAddSellOrder={(price) =>
          dispatch(
            ordersActions.addOrder({
              instrumentId: cell.instrumentId,
              price,
              side: 'sell',
              quantity: 100,
            }),
          )
        }
        onAddAlert={(price) =>
          dispatch(
            ordersActions.addAlert({
              instrumentId: cell.instrumentId,
              price,
            }),
          )
        }
        onResetZoom={() => {
          if (chart) {
            chart.timeScale().fitContent();
          }
        }}
        onClose={closeMenu}
      />
      {dragOver && <div className={ChartStyles.dropHint}>Drop to load instrument</div>}
    </div>
  );
}
