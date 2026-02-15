import { createTheme } from '@mantine/core';

/**
 * App palette is defined in theme.css via --app-* variables (light/dark).
 * Use vars.* in components so one place (theme.css) controls all colors.
 */

export const vars = {
  primary: () => 'var(--app-primary)',
  primaryHover: () => 'var(--app-primary-hover)',
  primaryLight: () => 'var(--app-primary-light)',
  accent: () => 'var(--app-accent)',

  bgPage: () => 'var(--app-bg-page)',
  bgCanvas: () => 'var(--app-bg-canvas)',
  bgCard: () => 'var(--app-bg-card)',
  bgSidebar: () => 'var(--app-bg-sidebar)',
  bgElevated: () => 'var(--app-bg-elevated)',

  nodeDefaultBg: () => 'var(--app-node-default-bg)',
  nodeDefaultBorder: () => 'var(--app-node-default-border)',
  nodeActiveBg: () => 'var(--app-node-active-bg)',
  nodeActiveBorder: () => 'var(--app-node-active-border)',
  nodeSuccessBg: () => 'var(--app-node-success-bg)',
  nodeSuccessBorder: () => 'var(--app-node-success-border)',
  nodeErrorBg: () => 'var(--app-node-error-bg)',
  nodeErrorBorder: () => 'var(--app-node-error-border)',
  nodeAiBg: () => 'var(--app-node-ai-bg)',
  nodeAiBorder: () => 'var(--app-node-ai-border)',
  nodeTriggerBg: () => 'var(--app-node-trigger-bg)',
  nodeTriggerBorder: () => 'var(--app-node-trigger-border)',

  edgeDefault: () => 'var(--app-edge-default)',
  edgeActive: () => 'var(--app-edge-active)',
  edgeHover: () => 'var(--app-edge-hover)',

  textPrimary: () => 'var(--app-text-primary)',
  textSecondary: () => 'var(--app-text-secondary)',
  textMuted: () => 'var(--app-text-muted)',
  textLink: () => 'var(--app-text-link)',

  success: () => 'var(--app-success)',
  successLight: () => 'var(--app-success-light)',
  successBorder: () => 'var(--app-node-success-border)',
  warning: () => 'var(--app-warning)',
  warningLight: () => 'var(--app-warning-light)',
  danger: () => 'var(--app-error)',
  dangerLight: () => 'var(--app-error-light)',
  dangerBorder: () => 'var(--app-node-error-border)',
  info: () => 'var(--app-info)',
  infoLight: () => 'var(--app-info-light)',
  primaryBorder: () => 'var(--app-node-active-border)',

  border: () => 'var(--app-border)',
  borderHover: () => 'var(--app-border-hover)',
  divider: () => 'var(--app-divider)',
  inputBorder: () => 'var(--app-input-border)',
  inputFocus: () => 'var(--app-input-focus)',
  disabled: () => 'var(--app-disabled)',
};

/* Mantine color scales so Button/Badge/Alert use app palette (primary = blue) */
const blueScale = [
  '#EFF6FF',
  '#DBEAFE',
  '#BFDBFE',
  '#93C5FD',
  '#60A5FA',
  '#3B82F6',
  '#2563EB',
  '#1D4ED8',
  '#1E40AF',
  '#1E3A8A',
];

const greenScale = [
  '#ECFDF5',
  '#D1FAE5',
  '#A7F3D0',
  '#6EE7B7',
  '#34D399',
  '#10B981',
  '#059669',
  '#047857',
  '#065F46',
  '#064E3B',
];

const redScale = [
  '#FEF2F2',
  '#FEE2E2',
  '#FECACA',
  '#FCA5A5',
  '#F87171',
  '#EF4444',
  '#DC2626',
  '#B91C1C',
  '#991B1B',
  '#7F1D1D',
];

const violetScale = [
  '#F5F3FF',
  '#EDE9FE',
  '#DDD6FE',
  '#C4B5FD',
  '#A78BFA',
  '#8B5CF6',
  '#7C3AED',
  '#6D28D9',
  '#5B21B6',
  '#4C1D95',
];

export const appTheme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  defaultRadius: 'md',
  colors: {
    blue: blueScale,
    green: greenScale,
    red: redScale,
    violet: violetScale,
  },
  other: {
    appVars: vars,
  },
});
