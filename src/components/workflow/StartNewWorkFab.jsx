import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../theme';

const PRIMARY = Colors.primary ?? '#062E52';
const FAB_BOTTOM_OFFSET = Spacing.lg ?? 16;
const FAB_RIGHT_OFFSET = Spacing.lg ?? 16;

/**
 * Fixed primary action for Add Work hub — clears current work and drafts.
 * Positioned above the tab bar (screen content ends at tab bar top).
 */
const StartNewWorkFab = ({ onPress, style }) => {
  const { t } = useTranslation('workflow');

  return (
    <View
      pointerEvents="box-none"
      style={[styles.anchor, { bottom: FAB_BOTTOM_OFFSET }, style]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('hub.startNewWorkAccessibility')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.label}>{t('hub.startNewWork')}</Text>
      </Pressable>
    </View>
  );
};

/** Extra scroll padding so the last workflow card clears the FAB. */
export const START_NEW_WORK_FAB_SCROLL_PADDING = 88;

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    right: FAB_RIGHT_OFFSET,
    zIndex: 100,
    elevation: 12,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  fabPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  icon: {
    marginRight: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: FontSize.sm ?? 14,
    fontFamily: FontFamily.semiBold ?? FontFamily.medium,
    fontWeight: FontWeight.semiBold ?? '600',
    letterSpacing: 0.2,
  },
});

export default StartNewWorkFab;
