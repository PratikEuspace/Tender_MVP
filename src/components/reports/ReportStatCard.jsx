import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { dashboardCardSurfaceStyle } from '../dashboard/dashboardCardBorder';

/** Figma main_reports stat card — 180×115, radius 15 */
const CARD_HEIGHT = 115;
const CARD_RADIUS = 15;

const VALUE_COLORS = {
  total: '#062E52',
  completed: '#2F5E34',
  inProgress: '#FF5D00',
  pending: '#C62828',
};

const ReportStatCard = ({
  value,
  title,
  subtitle,
  variant = 'total',
  style,
}) => {
  const valueColor = VALUE_COLORS[variant] ?? VALUE_COLORS.total;

  return (
    <View style={[styles.card, style]}>
      <Text
        style={[styles.value, { color: valueColor }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_RADIUS,
    ...dashboardCardSurfaceStyle,
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  value: {
    width: '100%',
    fontSize: 32,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 6,
    includeFontPadding: false,
    flexShrink: 0,
  },
  title: {
    width: '100%',
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 4,
    includeFontPadding: false,
    flexShrink: 0,
  },
  subtitle: {
    width: '100%',
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 2,
    includeFontPadding: false,
    flexShrink: 1,
  },
});

export default ReportStatCard;
