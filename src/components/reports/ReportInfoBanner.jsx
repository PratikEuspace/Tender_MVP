import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { dashboardCardSurfaceStyle } from '../dashboard/dashboardCardBorder';

const ReportInfoBanner = ({
  message = '₹0 of ₹0 total budget used (0%).',
  style,
}) => (
  <View style={[styles.banner, style]}>
    <View style={styles.iconWrap}>
      <Ionicons name="information-circle" size={22} color="#1A75BF" />
    </View>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDF5FC',
    borderRadius: 12,
    ...dashboardCardSurfaceStyle,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  iconWrap: {
    marginRight: 10,
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0A3D6B',
    lineHeight: 19,
  },
});

export default ReportInfoBanner;
