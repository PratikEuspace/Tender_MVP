import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import WorkProgressBar from './WorkProgressBar';

const STATIC_PERCENT = 58;
const STATIC_UPDATED = 'Today, 9:30 AM';

/**
 * “How much is done?” card — Work Progress screen only (static UI).
 * Sizing aligned to Figma (~380×148): compact padding and tighter vertical rhythm.
 */
const WorkProgressCompletionCard = ({ style }) => (
  <View style={[styles.section, style]}>
    <Text style={styles.sectionTitle}>How much is done?</Text>

    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.completionLabel}>Completion</Text>
        <View style={styles.updatedCol}>
          <Text style={styles.updatedLabel}>Last updated</Text>
          <Text style={styles.updatedValue}>{STATIC_UPDATED}</Text>
        </View>
      </View>

      <Text style={styles.percentValue}>
        {STATIC_PERCENT}
        <Text style={styles.percentSymbol}>%</Text>
      </Text>

      <WorkProgressBar percent={STATIC_PERCENT} showScale style={styles.progressBar} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 21,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  completionLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 15,
  },
  updatedCol: {
    alignItems: 'flex-end',
    maxWidth: 100,
  },
  updatedLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 12,
  },
  updatedValue: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 14,
    marginTop: 1,
    textAlign: 'right',
  },
  percentValue: {
    fontSize: 44,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 48,
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: 6,
  },
  percentSymbol: {
    fontSize: 44,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 48,
  },
  progressBar: {
    marginTop: 0,
  },
});

export default WorkProgressCompletionCard;
