import { StyleSheet } from 'react-native';

import theme from '../../theme';

/** Figma main_dashboard — section headings (Budget Utilisation, Recent Work, etc.) */
export const dashboardSectionLabelStyle = {
  fontSize: 18,
  fontFamily: theme.FontFamily?.bold ?? undefined,
  color: '#111827',
  lineHeight: 22,
  letterSpacing: 0.15,
};

export const dashboardSectionLabelText = StyleSheet.create({
  label: dashboardSectionLabelStyle,
});
