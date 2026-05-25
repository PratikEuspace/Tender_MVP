import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Visual tokens aligned with Reports Budget bar — workflow-only, no shared import.
const BAR_HEIGHT = 15;
const BAR_RADIUS = 40;
const TRACK_BG = 'rgba(0, 0, 0, 0.14)';
const GRADIENT_START = '#062E52';
const GRADIENT_END = '#0D67B8';

const SCALE_MARKS = ['0', '25', '50', '75', '100%'];

/**
 * Progress bar for Work Progress screen only.
 */
const WorkProgressBar = ({ percent = 0, showScale = false, style }) => {
  const clamped = Math.min(100, Math.max(0, percent));
  const fillWidth = `${clamped}%`;

  return (
    <View style={style}>
      <View style={styles.track}>
        {clamped > 0 ? (
          <View style={[styles.fillClip, { width: fillWidth }]}>
            <LinearGradient
              colors={[GRADIENT_START, GRADIENT_END]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.fillGradient}
            />
          </View>
        ) : null}
      </View>

      {showScale ? (
        <View style={styles.scaleRow}>
          {SCALE_MARKS.map((mark) => (
            <Text key={mark} style={styles.scaleLabel}>
              {mark}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    backgroundColor: TRACK_BG,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fillClip: {
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
    minWidth: 0,
  },
  fillGradient: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  scaleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default WorkProgressBar;
