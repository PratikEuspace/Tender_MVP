import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const STATUS_ITEMS = [
  {
    key: 'started',
    title: 'Started',
    subtitle: 'Work has begun on site',
    accent: '#0D67B8',
    selected: true,
  },
  {
    key: 'near_completion',
    title: 'Near completion',
    subtitle: 'Final stage, almost done',
    accent: '#1D6B43',
    selected: false,
  },
  {
    key: 'in_progress',
    title: 'In progress',
    subtitle: 'Actively ongoing, on track',
    accent: '#D97706',
    selected: false,
  },
  {
    key: 'delayed',
    title: 'Delayed',
    subtitle: 'Behind schedule',
    accent: '#C0392B',
    selected: false,
  },
];

const StatusIcon = ({ accent, variant }) => {
  if (variant === 'started') {
    return (
      <View style={[iconStyles.circle, { backgroundColor: accent }]}>
        <View style={iconStyles.playTriangle} />
      </View>
    );
  }
  if (variant === 'near_completion') {
    return (
      <View style={[iconStyles.circle, { backgroundColor: accent }]}>
        <View style={iconStyles.check} />
      </View>
    );
  }
  if (variant === 'in_progress') {
    return (
      <View style={[iconStyles.circle, { backgroundColor: accent }]}>
        <View style={iconStyles.clockHand} />
        <View style={iconStyles.clockDot} />
      </View>
    );
  }
  return (
    <View style={[iconStyles.circle, { backgroundColor: accent }]}>
      <View style={iconStyles.delayBar} />
    </View>
  );
};

const StatusCard = ({ item }) => (
  <View
    style={[
      styles.card,
      {
        borderColor: item.accent,
        backgroundColor: item.selected ? `${item.accent}12` : '#FFFFFF',
      },
      item.selected && styles.cardSelected,
    ]}
  >
    <StatusIcon accent={item.accent} variant={item.key} />
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
  </View>
);

/**
 * “What is the current status?” — static UI only (Work Progress screen).
 */
const WorkProgressStatusSection = ({ style }) => (
  <View style={[styles.section, style]}>
    <Text style={styles.sectionTitle}>What is the current status?</Text>
    <View style={styles.grid}>
      {STATUS_ITEMS.map((item) => (
        <View key={item.key} style={styles.gridCell}>
          <StatusCard item={item} />
        </View>
      ))}
    </View>
  </View>
);

const iconStyles = StyleSheet.create({
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
  check: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  clockHand: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    top: 7,
    left: 13,
  },
  clockDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 12,
    left: 12.5,
  },
  delayBar: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
});

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 21,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridCell: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  card: {
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 90,
  },
  cardSelected: {
    borderWidth: 1.5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 18,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default WorkProgressStatusSection;
