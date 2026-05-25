import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { dashboardCardSurfaceStyle } from './dashboardCardBorder';
import { dashboardSectionLabelStyle } from './dashboardTypography';

const PRIMARY = '#062E52';
const TRACK = '#E5E7EB';
const PROGRESS_BAR_HEIGHT = 20;
const PROGRESS_BAR_RADIUS = 10;

const BudgetUtilisationCard = ({ percent = 65, title = 'Budget Utilisation', style }) => {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barRow}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${clamped}%` }]} />
        </View>
        <Text style={styles.percent}>{clamped}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    ...dashboardCardSurfaceStyle,
    height: 80,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  title: {
    ...dashboardSectionLabelStyle,
    marginBottom: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_RADIUS,
    backgroundColor: TRACK,
    overflow: 'hidden',
    marginRight: 8,
    maxWidth: 300,
  },
  fill: {
    height: '100%',
    borderRadius: PROGRESS_BAR_RADIUS,
    backgroundColor: PRIMARY,
  },
  percent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 38,
    textAlign: 'right',
    lineHeight: 16,
  },
});

export default BudgetUtilisationCard;
