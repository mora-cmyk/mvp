import type { CSSProperties } from 'react';
import type { ChartContextMenuState } from '../hooks/useContextMenu';
import type { ThemePalette } from '../utils/themePresets';
import { formatPrice } from '../utils/formatPrice';
import MenuStyles from './ChartContextMenu.module.css';

interface ChartContextMenuProps {
  state: ChartContextMenuState;
  palette: ThemePalette;
  onAddBuyOrder: (price: number) => void;
  onAddSellOrder: (price: number) => void;
  onAddAlert: (price: number) => void;
  onResetZoom: () => void;
  onClose: () => void;
}

export function ChartContextMenu(props: ChartContextMenuProps) {
  const {
    state,
    palette,
    onAddBuyOrder,
    onAddSellOrder,
    onAddAlert,
    onResetZoom,
    onClose,
  } = props;
  if (!state.visible) {
    return null;
  }
  const css: CSSProperties = {
    left: state.x,
    top: state.y,
    ['--menu-bg' as string]: palette.tooltipBg,
    ['--menu-border' as string]: palette.tooltipBorder,
    ['--menu-text' as string]: palette.tooltipText,
  };
  const priceLabel =
    state.price !== null ? formatPrice(state.price) : '—';
  const priceDisabled = state.price === null;
  return (
    <div className={MenuStyles.menu} style={css}>
      <button
        type="button"
        className={`${MenuStyles.item} ${priceDisabled ? MenuStyles.disabled : ''}`}
        disabled={priceDisabled}
        onClick={() => {
          if (state.price !== null) {
            onAddBuyOrder(state.price);
          }
          onClose();
        }}
      >
        <span>Add buy order</span>
        <span>{priceLabel}</span>
      </button>
      <button
        type="button"
        className={`${MenuStyles.item} ${priceDisabled ? MenuStyles.disabled : ''}`}
        disabled={priceDisabled}
        onClick={() => {
          if (state.price !== null) {
            onAddSellOrder(state.price);
          }
          onClose();
        }}
      >
        <span>Add sell order</span>
        <span>{priceLabel}</span>
      </button>
      <button
        type="button"
        className={`${MenuStyles.item} ${priceDisabled ? MenuStyles.disabled : ''}`}
        disabled={priceDisabled}
        onClick={() => {
          if (state.price !== null) {
            onAddAlert(state.price);
          }
          onClose();
        }}
      >
        <span>Add alert</span>
        <span>{priceLabel}</span>
      </button>
      <div className={MenuStyles.separator} />
      <button
        type="button"
        className={MenuStyles.item}
        onClick={() => {
          onResetZoom();
          onClose();
        }}
      >
        <span>Reset zoom</span>
      </button>
    </div>
  );
}
