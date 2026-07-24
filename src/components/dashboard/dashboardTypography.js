import { StyleSheet } from 'react-native';

import { reportSectionLabelStyle } from '../reports/reportTypography';

/** Section headings — matches Reports (Work Report / Export Report). */
export const dashboardSectionLabelStyle = reportSectionLabelStyle;

export const dashboardSectionLabelText = StyleSheet.create({
  label: dashboardSectionLabelStyle,
});
