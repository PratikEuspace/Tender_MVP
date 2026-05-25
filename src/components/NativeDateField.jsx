import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import { Platform } from 'react-native';

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
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue = formatDateForStorage(value);

  const handleChange = useCallback(
    (event, selectedDate) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
      if (event?.type === 'dismissed') return;
      if (selectedDate) {
        onDateChange?.(selectedDate);
      }
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    },
    [onDateChange],
  );

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
        disabled={disabled}
      />
      {showPicker && !disabled ? (
        <DateTimePicker
          value={parseStoredDateForPicker(value)}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}
    </>
  );
};

export default NativeDateField;
