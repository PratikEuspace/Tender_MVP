import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import Inputboxfield from './Inputboxfield';
import {
  formatDateForStorage,
  parseStoredDateForPicker,
} from '../utils/dateFormat';

/**
 * Workflow date field — native @react-native-community/datetimepicker (Android default dialog).
 * value: DD/MM/YYYY string; onDateChange: (Date) => void
 */
const NativeDateField = ({
  label,
  value,
  onDateChange,
  placeholder = 'dd/mm/yyyy',
  minimumDate,
  maximumDate,
  error,
  required = false,
  helpKey,
  helpText,
  helpTooltipId,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue = formatDateForStorage(value);

  const handleValueChange = useCallback(
    (_event, selectedDate) => {
      setShowPicker(false);
      if (selectedDate) {
        onDateChange?.(selectedDate);
      }
    },
    [onDateChange],
  );

  const handleDismiss = useCallback(() => {
    setShowPicker(false);
  }, []);

  const openPicker = useCallback(() => {
    if (!disabled) {
      setShowPicker(true);
    }
  }, [disabled]);

  return (
    <>
      <Inputboxfield
        label={label}
        type="date"
        placeholder={placeholder}
        value={displayValue}
        onPress={openPicker}
        error={error}
        required={required}
        helpKey={helpKey}
        helpText={helpText}
        helpTooltipId={helpTooltipId}
        disabled={disabled}
      />
      {showPicker && !disabled && Platform.OS === 'android' ? (
        <DateTimePicker
          value={parseStoredDateForPicker(value)}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={handleValueChange}
          onDismiss={handleDismiss}
        />
      ) : null}
      {showPicker && !disabled && Platform.OS === 'ios' ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={handleDismiss}
        >
          <Pressable style={iosStyles.overlay} onPress={handleDismiss}>
            <View style={iosStyles.sheet} onStartShouldSetResponder={() => true}>
              <DateTimePicker
                value={parseStoredDateForPicker(value)}
                mode="date"
                display="inline"
                themeVariant="light"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onValueChange={handleValueChange}
                style={iosStyles.picker}
              />
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
};

/** iOS-only — modal calendar; Android does not use this. */
const iosStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  picker: {
    height: 360,
    width: '100%',
  },
});

export default NativeDateField;
