import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dropdown as ElementDropdown } from 'react-native-element-dropdown';

import {
  dismissKeyboardAfterClose,
  dismissKeyboardBeforeOverlay,
} from '../../utils/keyboardDismiss';

const DEFAULT_OPTIONS = [
  { label: 'FY 2025-26', value: '2025-26' },
  { label: 'FY 2024-25', value: '2024-25' },
  { label: 'FY 2023-24', value: '2023-24' },
];

const FinancialYearDropdown = ({
  value = '2025-26',
  onChange,
  options = DEFAULT_OPTIONS,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
    dismissKeyboardBeforeOverlay();
  }, []);

  const handleBlur = useCallback(() => {
    setIsOpen(false);
    dismissKeyboardAfterClose();
  }, []);

  const renderRightIcon = useCallback(
    (open) => (
      <Ionicons
        name={open ? 'chevron-up' : 'chevron-down'}
        size={14}
        color="#FFFFFF"
        style={styles.chevron}
      />
    ),
    [],
  );

  return (
    <View style={[styles.wrap, isOpen && styles.wrapOpen, style]}>
      <ElementDropdown
        style={styles.pillDropdown}
        containerStyle={styles.menuContainer}
        itemContainerStyle={styles.itemContainer}
        selectedTextStyle={styles.selectedText}
        placeholderStyle={styles.selectedText}
        activeColor="rgba(6, 46, 82, 0.08)"
        data={options}
        labelField="label"
        valueField="value"
        value={value}
        dropdownPosition="auto"
        maxHeight={220}
        zIndex={isOpen ? 3000 : 1}
        iconStyle={styles.hiddenIcon}
        renderRightIcon={renderRightIcon}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(item) => {
          onChange?.(item.value);
          dismissKeyboardAfterClose();
        }}
        renderItem={(item, selected) => (
          <View style={styles.itemRow}>
            <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
              {item.label}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    maxWidth: 130,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'visible',
  },
  wrapOpen: {
    zIndex: 3000,
    ...Platform.select({
      android: { elevation: 12 },
      default: {},
    }),
  },
  pillDropdown: {
    height: 32,
    minWidth: 110,
    paddingLeft: 12,
    paddingRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  menuContainer: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    paddingVertical: 4,
    minWidth: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  itemContainer: {
    borderRadius: 8,
  },
  itemRow: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  itemText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  itemTextSelected: {
    color: '#062E52',
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hiddenIcon: {
    width: 0,
    height: 0,
  },
  chevron: {
    marginLeft: 4,
  },
});

export default FinancialYearDropdown;
