import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import theme from '../theme';
import { getStatusLabel, useStatusLabel } from '../i18n/statusLabels';

// Figma Work List status chips — shared by filters + card badges
const CHIP_WIDTH = 112;
const CHIP_HEIGHT = 30;
const ICON_SIZE = 13;

const STATUS_CONFIG = {
  all: {
    color: '#555555',
    borderColor: '#C4C4C4',
    icon: null,
  },
  progress: {
    color: '#FF5D00',
    borderColor: '#FFB380',
    icon: 'time-outline',
  },
  completed: {
    color: '#2F5E34',
    borderColor: '#A8C5AA',
    icon: 'checkmark-circle-outline',
  },
};

const StatusChip = ({
  label,
  status = 'progress',
  selected = false,
  onPress,
  style,
  disabled = false,
  compact = false,
}) => {
  const { t } = useTranslation('common');
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.progress;
  const translatedLabel = useStatusLabel(status);
  const displayLabel = label ?? translatedLabel;
  const isInteractive = typeof onPress === 'function' && !disabled;

  const chipStyle = [
    compact ? styles.chipCompact : styles.chip,
    {
      backgroundColor: '#FFFFFF',
      borderColor: selected ? config.color : config.borderColor,
    },
    selected && styles.chipSelected,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    compact ? styles.labelCompact : styles.label,
    { color: config.color },
    selected && styles.labelSelected,
  ];

  const content = (
    <View style={styles.contentRow}>
      {config.icon ? (
        <Ionicons
          name={config.icon}
          size={ICON_SIZE}
          color={config.color}
          style={styles.icon}
        />
      ) : null}
      <Text style={labelStyle} numberOfLines={1}>
        {displayLabel}
      </Text>
    </View>
  );

  if (isInteractive) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.72}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={t('status.statusAccessibility', { label: displayLabel })}
        style={chipStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={chipStyle}
      accessibilityRole="text"
      accessibilityLabel={t('status.statusLabel', { label: displayLabel })}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    width: CHIP_WIDTH,
    height: CHIP_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chipCompact: {
    flex: 1,
    minWidth: 0,
    height: CHIP_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipSelected: {
    borderWidth: 1.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  icon: {
    marginRight: 4,
    flexShrink: 0,
  },
  label: {
    fontFamily: theme.FontFamily?.regular ?? 'Roboto',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    flexShrink: 1,
  },
  labelCompact: {
    fontFamily: theme.FontFamily?.regular ?? 'Roboto',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    flexShrink: 1,
  },
  labelSelected: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.45,
  },
});

export const workCompletedToChipStatus = (workCompleted) => {
  if (workCompleted === 'Completed') return 'completed';
  // Pending and any other/legacy value map to Progress.
  return 'progress';
};

export const workCompletedToChipLabel = (workCompleted) => {
  const status = workCompletedToChipStatus(workCompleted);
  return getStatusLabel(status);
};

export default StatusChip;
