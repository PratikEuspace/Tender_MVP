import { StyleSheet } from 'react-native';

import theme from '../../theme';

/** Figma main_dashboard — section headings (Budget Utilisation, Recent Work, etc.) */
export const dashboardSectionLabelStyle = {
  fontSize: 18,
  fontFamily: theme.FontFamily?.bold ?? undefined,
  color: '#111827',
  // Slightly taller than Latin metrics so Devanagari (Marathi) tops are not clipped.
  lineHeight: 26,
  letterSpacing: 0.15,
};

export const dashboardSectionLabelText = StyleSheet.create({
  label: dashboardSectionLabelStyle,
});
