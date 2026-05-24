import type { DeepPartial, ChartOptions } from 'lightweight-charts';
import type { ThemeName } from '../../../types/chart';

export interface ThemePalette {
  background: string;
  text: string;
  grid: string;
  border: string;
  upColor: string;
  downColor: string;
  wickUp: string;
  wickDown: string;
  volumeUp: string;
  volumeDown: string;
  crosshair: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  toolbarBg: string;
  toolbarText: string;
  panelBg: string;
  accent: string;
  orderBuy: string;
  orderSell: string;
  alert: string;
}

export const LIGHT_THEME: ThemePalette = {
  background: '#ffffff',
  text: '#1a1a1a',
  grid: '#e8e8e8',
  border: '#d0d0d0',
  upColor: '#26a69a',
  downColor: '#ef5350',
  wickUp: '#26a69a',
  wickDown: '#ef5350',
  volumeUp: 'rgba(38,166,154,0.5)',
  volumeDown: 'rgba(239,83,80,0.5)',
  crosshair: '#9598a1',
  tooltipBg: 'rgba(255,255,255,0.96)',
  tooltipBorder: '#d0d0d0',
  tooltipText: '#1a1a1a',
  toolbarBg: '#f6f7f9',
  toolbarText: '#1a1a1a',
  panelBg: '#ffffff',
  accent: '#2962ff',
  orderBuy: '#1e88e5',
  orderSell: '#e53935',
  alert: '#f59e0b',
};

export const DARK_THEME: ThemePalette = {
  background: '#0e1116',
  text: '#d1d4dc',
  grid: '#1f242c',
  border: '#2a313c',
  upColor: '#26a69a',
  downColor: '#ef5350',
  wickUp: '#26a69a',
  wickDown: '#ef5350',
  volumeUp: 'rgba(38,166,154,0.45)',
  volumeDown: 'rgba(239,83,80,0.45)',
  crosshair: '#5a606b',
  tooltipBg: 'rgba(20,24,32,0.96)',
  tooltipBorder: '#2a313c',
  tooltipText: '#d1d4dc',
  toolbarBg: '#151a21',
  toolbarText: '#d1d4dc',
  panelBg: '#0e1116',
  accent: '#4f8cff',
  orderBuy: '#42a5f5',
  orderSell: '#ef5350',
  alert: '#f59e0b',
};

export const GREY_THEME: ThemePalette = {
  background: '#2a2e36',
  text: '#cfd2d8',
  grid: '#3a3f49',
  border: '#454a55',
  upColor: '#7cb342',
  downColor: '#e57373',
  wickUp: '#7cb342',
  wickDown: '#e57373',
  volumeUp: 'rgba(124,179,66,0.45)',
  volumeDown: 'rgba(229,115,115,0.45)',
  crosshair: '#7a808a',
  tooltipBg: 'rgba(50,54,62,0.96)',
  tooltipBorder: '#454a55',
  tooltipText: '#cfd2d8',
  toolbarBg: '#33373f',
  toolbarText: '#cfd2d8',
  panelBg: '#2a2e36',
  accent: '#7cb342',
  orderBuy: '#64b5f6',
  orderSell: '#e57373',
  alert: '#f4b740',
};

export function getTheme(name: ThemeName): ThemePalette {
  switch (name) {
    case 'light':
      return LIGHT_THEME;
    case 'dark':
      return DARK_THEME;
    case 'grey':
      return GREY_THEME;
  }
}

export function chartOptionsForTheme(
  palette: ThemePalette,
): DeepPartial<ChartOptions> {
  return {
    layout: {
      background: { color: palette.background },
      textColor: palette.text,
      attributionLogo: false,
    },
    grid: {
      vertLines: { color: palette.grid },
      horzLines: { color: palette.grid },
    },
    rightPriceScale: { borderColor: palette.border },
    timeScale: { borderColor: palette.border },
    crosshair: {
      vertLine: { color: palette.crosshair },
      horzLine: { color: palette.crosshair },
    },
  };
}
