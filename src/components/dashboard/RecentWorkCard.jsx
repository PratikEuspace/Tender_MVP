import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import StatusChip from '../Statuschip';
import { dashboardCardBorderStyle } from './dashboardCardBorder';

const RecentWorkCard = ({
  title,
  code = 'Code',
  status = 'progress',
  iconName = 'construct-outline',
  style,
}) => (
  <View style={[styles.card, style]}>
    <View style={styles.iconCircle}>
      <Ionicons name={iconName} size={20} color="#374151" />
    </View>

    <View style={styles.body}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.code} numberOfLines={1}>
        {code}
      </Text>
    </View>

    <StatusChip status={status} style={styles.statusChip} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...dashboardCardBorderStyle,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  code: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusChip: {
    flexShrink: 0,
  },
});

export default RecentWorkCard;
