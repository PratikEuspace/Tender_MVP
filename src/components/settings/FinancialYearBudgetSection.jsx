import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import FormDropdown from '../FormDropdown';
import Inputboxfield from '../Inputboxfield';
import PrimaryButton from '../PrimaryButton';
import { FINANCIAL_YEAR_OPTIONS } from '../../constants/dropdownOptions';
import {
  getFinancialYearBudget,
  upsertFinancialYearBudget,
} from '../../db/repositories/financialYearBudgetRepository';
import { localizeDropdownOptions } from '../../i18n/workflowLabels';
import theme from '../../theme';
import {
  dismissKeyboard,
  dismissKeyboardAfterClose,
} from '../../utils/keyboardDismiss';

/** Unselected financial year — not stored in SQLite. */
const EMPTY_FY_VALUE = '';

const FinancialYearBudgetSection = () => {
  const { t } = useTranslation(['settings', 'workflow', 'auth', 'common']);
  const budgetInputRef = useRef(null);
  const [financialYear, setFinancialYear] = useState(EMPTY_FY_VALUE);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const releaseBudgetInputFocus = useCallback(() => {
    budgetInputRef.current?.blur?.();
    dismissKeyboard();
  }, []);

  const resetBudgetForm = useCallback(() => {
    setFinancialYear(EMPTY_FY_VALUE);
    setBudgetAmount('');
    releaseBudgetInputFocus();
  }, [releaseBudgetInputFocus]);

  const showBudgetAlert = useCallback(
    (title, message) => {
      Alert.alert(title, message, [
        {
          text: t('auth:ok'),
          onPress: dismissKeyboardAfterClose,
        },
      ]);
    },
    [t],
  );

  const fyOptions = useMemo(
    () => [
      { label: t('common:dash'), value: EMPTY_FY_VALUE },
      ...localizeDropdownOptions(FINANCIAL_YEAR_OPTIONS, t),
    ],
    [t],
  );

  const loadBudgetForYear = useCallback((fy) => {
    if (!fy) {
      setBudgetAmount('');
      return;
    }

    try {
      const row = getFinancialYearBudget(fy);
      setBudgetAmount(
        row?.budget_amount != null && row.budget_amount > 0
          ? String(row.budget_amount)
          : '',
      );
    } catch (error) {
      console.error('[FinancialYearBudgetSection] load failed:', error);
      setBudgetAmount('');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetBudgetForm();
    }, [resetBudgetForm]),
  );

  const handleYearChange = (item) => {
    const nextYear = item?.value ?? EMPTY_FY_VALUE;
    setFinancialYear(nextYear);
    loadBudgetForYear(nextYear);
  };

  const handleSave = () => {
    if (saving) return;

    releaseBudgetInputFocus();

    if (!financialYear) {
      showBudgetAlert(
        t('settings:fyBudget.yearRequiredTitle'),
        t('settings:fyBudget.yearRequiredMessage'),
      );
      return;
    }

    const amount = parseFloat(String(budgetAmount).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(amount) || amount < 0) {
      showBudgetAlert(t('settings:fyBudget.invalidTitle'), t('settings:fyBudget.invalidMessage'));
      return;
    }

    setSaving(true);
    try {
      upsertFinancialYearBudget(financialYear, amount);
      resetBudgetForm();
      showBudgetAlert(t('settings:fyBudget.savedTitle'), t('settings:fyBudget.savedMessage'));
    } catch (error) {
      console.error('[FinancialYearBudgetSection] save failed:', error);
      showBudgetAlert(t('settings:fyBudget.errorTitle'), t('settings:fyBudget.errorMessage'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>{t('settings:fyBudget.subtitle')}</Text>

      <FormDropdown
        label={t('settings:fyBudget.financialYearLabel')}
        placeholder={t('settings:fyBudget.financialYearPlaceholder')}
        data={fyOptions}
        value={financialYear}
        onChange={handleYearChange}
      />

      <Inputboxfield
        ref={budgetInputRef}
        label={t('settings:fyBudget.amountLabel')}
        placeholder={t('settings:fyBudget.amountPlaceholder')}
        type="number"
        keyboardType="numeric"
        value={budgetAmount}
        onChangeText={setBudgetAmount}
      />

      <PrimaryButton
        title={t('settings:fyBudget.save')}
        fullWidth
        loading={saving}
        style={styles.saveButton}
        onPress={handleSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.Spacing?.xs ?? 4,
  },
  hint: {
    fontSize: theme.FontSize?.sm ?? 13,
    color: theme.Colors?.textSecondary ?? '#666666',
    marginBottom: theme.Spacing?.sm ?? 8,
  },
  saveButton: {
    marginTop: theme.Spacing?.md ?? 16,
  },
});

export default FinancialYearBudgetSection;
