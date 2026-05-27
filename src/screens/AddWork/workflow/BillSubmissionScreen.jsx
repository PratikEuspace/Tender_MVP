// src/screens/AddWork/workflow/BillSubmissionScreen.jsx
// Step 10: Payment Status
//
// Payments are a ledger: every Save & Continue with a positive amount appends
// a new installment row. Summary cards sum across all installments. The form
// itself is the "next installment" being entered; auto-save keeps it in
// Zustand draft only — no SQLite write until Save & Continue.

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import FormToggleField from '../../../components/FormToggleField';
import Inputboxfield from '../../../components/Inputboxfield';
import ProgressSlot from '../../../components/layouts/Progressslot';
import ScreenLayout from '../../../components/layouts/Screenlayout';
import WorkflowProgress from '../../../components/layouts/Workflowprogress';
import NativeDateField from '../../../components/NativeDateField';
import PrimaryButton from '../../../components/PrimaryButton';
import UploadDocument from '../../../components/UploadDocument';
import PaymentHistoryCard from '../../../components/workflow/PaymentHistoryCard';
import { DOCUMENT_TYPES } from '../../../constants/documentTypes';
import useDocumentUpload from '../../../hooks/useDocumentUpload';
import { formatDateForStorage } from '../../../utils/dateFormat';
import { buildUploadDocumentEntry } from '../../../utils/documentUploadProps';

import useSaveAndContinue from '../../../hooks/useSaveAndContinue';
import useWorkflowAutoSave from '../../../hooks/useWorkflowAutoSave';
import useWorkflowStepGuard from '../../../hooks/useWorkflowStepGuard';
import useDraftStore from '../../../store/useDraftStore';
import useWorkStore from '../../../store/useWorkStore';

import { TOTAL_WORKFLOW_STEPS, WORKFLOW_ROUTES } from '../../../constants/WorkflowSteps';
import {
  appendPaymentInstallment,
  getPaymentInstallmentsForWork,
  getPaymentSummaryForWork,
} from '../../../db/repositories/paymentsRepository';
import theme from '../../../theme';

const formatRupee = (amount) => {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const parseAmount = (value) => {
  if (value == null || value === '') return 0;
  const n = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const TEXT = theme.Colors?.text ?? '#1A1A1A';
const SECONDARY = theme.Colors?.secondary ?? '#777777';
const BORDER = theme.Colors?.border ?? '#E0E0E0';
const WHITE = theme.Colors?.white ?? '#FFFFFF';
const PENDING = '#C0392B';
const PAID = '#1D6B43';

const SummaryCard = ({ label, value, valueColor }) => (
  <View style={cardStyles.card}>
    <Text style={cardStyles.label}>{label}</Text>
    <Text style={[cardStyles.value, { color: valueColor ?? TEXT }]}>{value}</Text>
  </View>
);

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: theme.Radius?.md ?? 10,
    backgroundColor: WHITE,
    paddingVertical: theme.Spacing?.sm ?? 10,
    paddingHorizontal: theme.Spacing?.xs ?? 8,
    marginHorizontal: 3,
  },
  label: {
    fontSize: theme.FontSize?.xs ?? 11,
    color: SECONDARY,
    marginBottom: 4,
  },
  value: {
    fontSize: theme.FontSize?.md ?? 15,
    fontWeight: '700',
  },
});

const EMPTY_FORM = {
  payment_released: false,
  amount_paid: '',
  payment_date: '',
  payment_pdf_path: '',
};

const EMPTY_SUMMARY = { totalBill: 0, amountPaid: 0, pending: 0 };

const BillSubmissionScreen = ({ navigation }) => {
  useWorkflowStepGuard(WORKFLOW_ROUTES.PAYMENT_STATUS, navigation);

  const getDraft = useDraftStore((s) => s.getDraft);
  const setDraft = useDraftStore((s) => s.setDraft);
  const { currentWorkId } = useWorkStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [installments, setInstallments] = useState([]);

  const { bindForm, scheduleDebouncedSave, saveImmediately } =
    useWorkflowAutoSave('paymentStatus');

  useEffect(() => {
    bindForm(form);
  }, [form, bindForm]);

  const refreshLedger = useCallback(() => {
    if (!currentWorkId) {
      setSummary(EMPTY_SUMMARY);
      setInstallments([]);
      return EMPTY_SUMMARY;
    }
    const nextSummary = getPaymentSummaryForWork(currentWorkId);
    const nextInstallments = getPaymentInstallmentsForWork(currentWorkId);
    setSummary(nextSummary);
    setInstallments(nextInstallments);
    return nextSummary;
  }, [currentWorkId]);

  const updateField = useCallback(
    (key, value, { immediate = false } = {}) => {
      setForm((prev) => {
        const updated = { ...prev, [key]: value };
        queueMicrotask(() => {
          setDraft('paymentStatus', updated);
          bindForm(updated);
          if (immediate) saveImmediately();
          else scheduleDebouncedSave();
        });
        return updated;
      });
    },
    [setDraft, bindForm, scheduleDebouncedSave, saveImmediately],
  );

  const handleToggle = useCallback(() => {
    updateField('payment_released', !form.payment_released, { immediate: true });
  }, [form.payment_released, updateField]);

  // Hydration: load ledger from SQLite, hydrate form ONLY from in-session draft.
  // Form starts empty after every fresh app open so it represents "next installment".
  useEffect(() => {
    refreshLedger();

    const draft = getDraft('paymentStatus');
    if (draft && Object.keys(draft).length > 0) {
      const merged = { ...EMPTY_FORM, ...draft };
      setForm(merged);
      bindForm(merged);
    }
  }, [currentWorkId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh ledger whenever the screen regains focus (e.g. after navigating
  // back from Bill Submission or any future installment edit screen).
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshLedger();
    });
    return unsubscribe;
  }, [navigation, refreshLedger]);

  // Live preview of summary while user types a new installment amount
  const liveSummary = (() => {
    if (!form.payment_released) return summary;
    const typed = parseAmount(form.amount_paid);
    if (typed <= 0) return summary;
    const liveAmount = summary.amountPaid + typed;
    return {
      totalBill: summary.totalBill,
      amountPaid: liveAmount,
      pending: Math.max(0, summary.totalBill - liveAmount),
    };
  })();

  // Persist function for Save & Continue. Overpayment is validated separately
  // in handleSave so we never throw inside useSaveAndContinue (which would
  // otherwise log a red console.error and surface RN's LogBox overlay).
  const persistPaymentStep = useCallback(
    (workId, data) => {
      if (!workId) return null;

      // Toggle OFF or no positive amount — advance without appending a row.
      if (!data.payment_released) return workId;

      const amount = parseAmount(data.amount_paid);
      if (amount <= 0) return workId;

      appendPaymentInstallment(workId, {
        amount_paid: amount,
        payment_date: data.payment_date || null,
        payment_receipt_path: data.payment_pdf_path || null,
      });

      // Installment is now in history. Reset the form + reload ledger so the
      // just-saved amount isn't double-counted by liveSummary when the user
      // navigates back to this screen (React Navigation keeps it mounted).
      setForm(EMPTY_FORM);
      bindForm(EMPTY_FORM);
      refreshLedger();

      return workId;
    },
    [bindForm, refreshLedger],
  );

  const { saveAndContinue, isSaving } = useSaveAndContinue(
    'paymentStatus',
    persistPaymentStep,
    WORKFLOW_ROUTES.BILL_SUBMISSION,
    WORKFLOW_ROUTES.PAYMENT_STATUS,
  );

  const { pickDocument: pickPaymentReceipt, uploading: uploadingPaymentReceipt } =
    useDocumentUpload(
      currentWorkId,
      DOCUMENT_TYPES.PAYMENT_RECEIPT,
      (filePath) => updateField('payment_pdf_path', filePath, { immediate: true }),
    );

  const handleSave = () => {
    // Overpayment check — show a friendly alert, stay on the screen.
    if (currentWorkId && form.payment_released) {
      const amount = parseAmount(form.amount_paid);
      if (amount > 0) {
        const currentSummary = getPaymentSummaryForWork(currentWorkId);
        const remaining = Math.max(
          0,
          currentSummary.totalBill - currentSummary.amountPaid,
        );
        if (currentSummary.totalBill > 0 && amount > remaining) {
          Alert.alert(
            'Payment exceeds pending',
            `Entered amount exceeds pending payment. Please enter ${formatRupee(
              remaining,
            )} or less.`,
          );
          return;
        }
      }
    }

    saveAndContinue(form, navigation, {
      onValidationFail: (m) => Alert.alert('Save Failed', m),
    });
  };

  return (
    <ScreenLayout
      title="Payment Status"
      showBack
      showNotification
      scrollable
      keyboardAware
      onBackPress={() => navigation.goBack()}
    >
      <WorkflowProgress
        currentStep={10}
        totalSteps={TOTAL_WORKFLOW_STEPS}
        showPercentage
        style={styles.progress}
      />
      <ProgressSlot
        step={10}
        title="Payment Status"
        description="Track payment release and amount paid"
        screenType="paymentStatus"
      />

      <View style={styles.summaryRow}>
        <SummaryCard
          label="Total bill amount"
          value={formatRupee(liveSummary.totalBill)}
          valueColor={TEXT}
        />
        <SummaryCard
          label="Amount paid"
          value={formatRupee(liveSummary.amountPaid)}
          valueColor={PAID}
        />
        <SummaryCard
          label="Pending"
          value={formatRupee(liveSummary.pending)}
          valueColor={PENDING}
        />
      </View>

      <FormToggleField
        rowLabelOn="Payment released"
        rowLabelOff="Payment not released"
        value={form.payment_released}
        onToggle={handleToggle}
      />

      {form.payment_released && (
        <>
          <Inputboxfield
            label="Amount paid (₹)"
            placeholder="Amount paid (₹)"
            type="number"
            keyboardType="numeric"
            value={form.amount_paid}
            onChangeText={(v) => updateField('amount_paid', v)}
          />

          <NativeDateField
            label="Payment date"
            placeholder="dd/mm/yy"
            value={form.payment_date}
            onDateChange={(date) =>
              updateField('payment_date', formatDateForStorage(date), { immediate: true })
            }
          />

          <UploadDocument
            sectionLabel="Documents"
            documents={[
              buildUploadDocumentEntry({
                title: 'Payment PDF',
                uploadText: 'Upload Payment PDF',
                filePath: form.payment_pdf_path,
                onPress: pickPaymentReceipt,
                loading: uploadingPaymentReceipt,
              }),
            ]}
          />
        </>
      )}

      <PaymentHistoryCard installments={installments} />

      <PrimaryButton
        title="Save & Continue"
        loading={isSaving}
        fullWidth
        style={styles.cta}
        onPress={handleSave}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  progress: { marginBottom: theme.Spacing?.sm ?? 8 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.Spacing?.sm ?? 8,
    marginBottom: theme.Spacing?.md ?? 14,
    marginHorizontal: -3,
  },
  cta: {
    marginTop: theme.Spacing?.lg ?? 24,
    marginBottom: theme.Spacing?.xl ?? 32,
  },
});

export default BillSubmissionScreen;
