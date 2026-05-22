import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { chartActions } from '../../store/chartSlice';
import type { IndicatorKind, IndicatorParams } from '../../types/indicator';
import { INDICATOR_KINDS } from '../Chart/utils/constants';
import HeaderStyles from './ChartHeader.module.css';

function defaultParamsFor(kind: IndicatorKind): IndicatorParams {
  if (kind === 'SMA') {
    return { kind: 'SMA', params: { period: 20, color: '#2962ff' } };
  }
  if (kind === 'EMA') {
    return { kind: 'EMA', params: { period: 20, color: '#ff6d00' } };
  }
  if (kind === 'BB') {
    return {
      kind: 'BB',
      params: { period: 20, stdDev: 2, color: '#9c27b0' },
    };
  }
  if (kind === 'RSI') {
    return { kind: 'RSI', params: { period: 14, color: '#26a69a' } };
  }
  return {
    kind: 'MACD',
    params: { fast: 12, slow: 26, signal: 9 },
  };
}

export function IndicatorsPanel() {
  const dispatch = useAppDispatch();
  const activeCell = useAppSelector(
    (s) => s.chart.cells.find((c) => c.id === s.chart.activeCellId) ?? null,
  );
  const [open, setOpen] = useState(false);
  const [selectedKind, setSelectedKind] = useState<IndicatorKind>('SMA');
  const [period, setPeriod] = useState(20);
  const [stdDev, setStdDev] = useState(2);
  const [fast, setFast] = useState(12);
  const [slow, setSlow] = useState(26);
  const [signal, setSignal] = useState(9);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onDoc = (ev: MouseEvent): void => {
      if (
        panelRef.current &&
        ev.target instanceof Node &&
        !panelRef.current.contains(ev.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!activeCell) {
    return null;
  }

  const handleAdd = (): void => {
    let config: IndicatorParams;
    if (selectedKind === 'SMA') {
      config = { kind: 'SMA', params: { period, color: '#2962ff' } };
    } else if (selectedKind === 'EMA') {
      config = { kind: 'EMA', params: { period, color: '#ff6d00' } };
    } else if (selectedKind === 'BB') {
      config = {
        kind: 'BB',
        params: { period, stdDev, color: '#9c27b0' },
      };
    } else if (selectedKind === 'RSI') {
      config = { kind: 'RSI', params: { period, color: '#26a69a' } };
    } else {
      config = { kind: 'MACD', params: { fast, slow, signal } };
    }
    dispatch(
      chartActions.addIndicator({ cellId: activeCell.id, config }),
    );
  };

  const handleKindChange = (kind: IndicatorKind): void => {
    setSelectedKind(kind);
    const def = defaultParamsFor(kind);
    if (def.kind === 'SMA' || def.kind === 'EMA' || def.kind === 'RSI') {
      setPeriod(def.params.period);
    }
    if (def.kind === 'BB') {
      setPeriod(def.params.period);
      setStdDev(def.params.stdDev);
    }
    if (def.kind === 'MACD') {
      setFast(def.params.fast);
      setSlow(def.params.slow);
      setSignal(def.params.signal);
    }
  };

  return (
    <div className={`${HeaderStyles.group} ${HeaderStyles.dropdown}`}>
      <button
        type="button"
        className={HeaderStyles.btn}
        onClick={() => setOpen((v) => !v)}
      >
        Indicators ({activeCell.indicators.length})
      </button>
      {open && (
        <div className={HeaderStyles.dropdownPanel} ref={panelRef}>
          <div className={HeaderStyles.dropdownRow}>
            <span className={HeaderStyles.label}>Add</span>
            <select
              className={HeaderStyles.select}
              value={selectedKind}
              onChange={(e) =>
                handleKindChange(e.target.value as IndicatorKind)
              }
            >
              {INDICATOR_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          {(selectedKind === 'SMA' ||
            selectedKind === 'EMA' ||
            selectedKind === 'RSI' ||
            selectedKind === 'BB') && (
            <div className={HeaderStyles.dropdownRow}>
              <span className={HeaderStyles.label}>Period</span>
              <input
                className={HeaderStyles.customNumber}
                type="number"
                min={2}
                max={300}
                value={period}
                onChange={(e) =>
                  setPeriod(
                    Math.max(2, parseInt(e.target.value, 10) || 2),
                  )
                }
              />
            </div>
          )}
          {selectedKind === 'BB' && (
            <div className={HeaderStyles.dropdownRow}>
              <span className={HeaderStyles.label}>StdDev</span>
              <input
                className={HeaderStyles.customNumber}
                type="number"
                step="0.1"
                min={0.5}
                max={5}
                value={stdDev}
                onChange={(e) =>
                  setStdDev(parseFloat(e.target.value) || 2)
                }
              />
            </div>
          )}
          {selectedKind === 'MACD' && (
            <>
              <div className={HeaderStyles.dropdownRow}>
                <span className={HeaderStyles.label}>Fast</span>
                <input
                  className={HeaderStyles.customNumber}
                  type="number"
                  min={2}
                  max={100}
                  value={fast}
                  onChange={(e) =>
                    setFast(Math.max(2, parseInt(e.target.value, 10) || 2))
                  }
                />
              </div>
              <div className={HeaderStyles.dropdownRow}>
                <span className={HeaderStyles.label}>Slow</span>
                <input
                  className={HeaderStyles.customNumber}
                  type="number"
                  min={2}
                  max={200}
                  value={slow}
                  onChange={(e) =>
                    setSlow(Math.max(2, parseInt(e.target.value, 10) || 2))
                  }
                />
              </div>
              <div className={HeaderStyles.dropdownRow}>
                <span className={HeaderStyles.label}>Signal</span>
                <input
                  className={HeaderStyles.customNumber}
                  type="number"
                  min={2}
                  max={100}
                  value={signal}
                  onChange={(e) =>
                    setSignal(
                      Math.max(2, parseInt(e.target.value, 10) || 2),
                    )
                  }
                />
              </div>
            </>
          )}
          <div className={HeaderStyles.dropdownRow}>
            <button
              type="button"
              className={HeaderStyles.btn}
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
          {activeCell.indicators.length > 0 && (
            <div className={HeaderStyles.indicatorList}>
              {activeCell.indicators.map((ind) => (
                <div className={HeaderStyles.dropdownRow} key={ind.id}>
                  <span className={HeaderStyles.indicatorName}>
                    {describeIndicator(ind.config)}
                  </span>
                  <button
                    type="button"
                    className={HeaderStyles.removeBtn}
                    onClick={() =>
                      dispatch(
                        chartActions.removeIndicator({
                          cellId: activeCell.id,
                          indicatorId: ind.id,
                        }),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function describeIndicator(c: IndicatorParams): string {
  if (c.kind === 'SMA') return `SMA(${c.params.period})`;
  if (c.kind === 'EMA') return `EMA(${c.params.period})`;
  if (c.kind === 'BB')
    return `BB(${c.params.period}, ${c.params.stdDev})`;
  if (c.kind === 'RSI') return `RSI(${c.params.period})`;
  return `MACD(${c.params.fast}, ${c.params.slow}, ${c.params.signal})`;
}
