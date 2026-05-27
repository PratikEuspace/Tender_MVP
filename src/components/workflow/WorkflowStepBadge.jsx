import React from 'react';
import { StyleSheet, View } from 'react-native';

const COMPLETED_GREEN = '#1D6B43';
const PENDING_YELLOW = '#F4B400';
const LOCK_GREY = '#AAAAAA';

/**
 * Left status badge for Add Work workflow cards.
 * completed → green check | pending → yellow in-progress | locked → grey lock
 */
const WorkflowStepBadge = ({ status = 'locked' }) => {
  if (status === 'completed') {
    return (
      <View style={[styles.circle, { backgroundColor: COMPLETED_GREEN }]}>
        <View style={styles.tick} />
      </View>
    );
  }

  if (status === 'pending') {
    return (
      <View style={[styles.circle, { backgroundColor: PENDING_YELLOW }]}>
        <View style={styles.pendingRing} />
        <View style={styles.pendingHand} />
      </View>
    );
  }

  return (
    <View style={styles.lockWrap}>
      <View style={[styles.lockBody, { backgroundColor: LOCK_GREY }]} />
      <View style={[styles.lockShackle, { borderColor: LOCK_GREY }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tick: {
    width: 9,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  pendingRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
  },
  pendingHand: {
    position: 'absolute',
    width: 1.5,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    top: 6,
    left: 9,
    transform: [{ rotate: '45deg' }],
  },
  lockWrap: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBody: {
    width: 11,
    height: 8,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
  },
  lockShackle: {
    width: 7,
    height: 6,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    top: 3,
  },
});

export default WorkflowStepBadge;
