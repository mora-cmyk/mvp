import { MOCK_INSTRUMENTS } from '../../mocks/instruments';
import HeaderStyles from './ChartHeader.module.css';

export function InstrumentDragHandle() {
  return (
    <div className={HeaderStyles.group}>
      <span className={HeaderStyles.label}>Drag:</span>
      {MOCK_INSTRUMENTS.map((i) => (
        <span
          key={i.id}
          className={HeaderStyles.activeChip}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/x-instrument-id', i.id);
            e.dataTransfer.effectAllowed = 'copy';
          }}
        >
          {i.symbol}
        </span>
      ))}
    </div>
  );
}
