import Ionicons from '@expo/vector-icons/Ionicons';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import theme from '../../theme';
import { resolveSubscriptionStartDate } from '../../utils/subscriptionDisplay';
import {
  clearActivationSuccessPending,
  getActivationSuccessActivatedAt,
} from '../../utils/activationSuccessGate';
import useAuthStore from '../../store/useAuthStore';

const PRIMARY = theme.Colors.primary ?? '#062E52';

/**
 * One-time centered overlay after successful activation.
 * Data is read from the existing auth session (no Firebase / API calls).
 */
const ActivationSuccessCard = ({ visible, onDismiss }) => {
  const { t } = useTranslation('dashboard');
  const name = useAuthStore((state) => state.name);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const durationValue = useAuthStore((state) => state.durationValue);
  const durationUnit = useAuthStore((state) => state.durationUnit);

  const displayName = (name ?? '').trim() || t('activationSuccess.fallbackName');

  const startIso = resolveSubscriptionStartDate(
    expiresAt,
    durationValue,
    durationUnit,
    getActivationSuccessActivatedAt(),
  );
  const formatCardDate = (iso) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    // Force abbreviated English month (e.g. "10 Jul 2026") regardless of UI language.
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const startLabel = formatCardDate(startIso);
  const endLabel = formatCardDate(expiresAt);

  const handleContinue = () => {
    clearActivationSuccessPending();
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleContinue}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={52} color={PRIMARY} />
          </View>

          <Text style={styles.successLabel}>{t('activationSuccess.success')}</Text>
          <Text style={styles.title}>{t('activationSuccess.activated')}</Text>

          <Text style={styles.sectionEyebrow}>{t('activationSuccess.welcome')}</Text>
          <Text style={styles.userName} numberOfLines={2}>
            {displayName}
          </Text>

          <Text style={styles.sectionEyebrow}>{t('activationSuccess.subscription')}</Text>
          <Text style={styles.dateText}>{startLabel}</Text>
          <Text style={styles.arrow}>↓</Text>
          <Text style={styles.dateText}>{endLabel}</Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={t('activationSuccess.continue')}
          >
            <Text style={styles.continueText}>{t('activationSuccess.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 46, 82, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.Spacing?.xl ?? 32,
  },
  card: {
    width: '86%',
    maxWidth: 292,
    backgroundColor: theme.Colors.white ?? '#FFFFFF',
    borderRadius: theme.Radius?.lg ?? 14,
    paddingHorizontal: theme.Spacing?.md ?? 16,
    paddingTop: theme.Spacing?.lg ?? 24,
    paddingBottom: theme.Spacing?.md ?? 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    marginBottom: 6,
  },
  successLabel: {
    fontFamily: theme.FontFamily?.semiBold,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontSize: theme.FontSize?.md ?? 16,
    color: PRIMARY,
    marginBottom: 2,
  },
  title: {
    fontFamily: theme.FontFamily?.bold,
    fontWeight: theme.FontWeight?.bold ?? '700',
    fontSize: theme.FontSize?.xl ?? 22,
    color: theme.Colors.textPrimary ?? '#1A1A1A',
    textAlign: 'center',
    marginBottom: theme.Spacing?.md ?? 16,
  },
  sectionEyebrow: {
    fontFamily: theme.FontFamily?.bold,
    fontWeight: theme.FontWeight?.bold ?? '700',
    fontSize: theme.FontSize?.sm ?? 13,
    color: theme.Colors.textPrimary ?? '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  userName: {
    fontFamily: theme.FontFamily?.semiBold,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontSize: theme.FontSize?.lg ?? 18,
    color: theme.Colors.textSecondary ?? '#666666',
    textAlign: 'center',
    marginBottom: theme.Spacing?.md ?? 16,
  },
  dateText: {
    fontFamily: theme.FontFamily?.semiBold,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontSize: theme.FontSize?.md ?? 16,
    color: theme.Colors.textSecondary ?? '#666666',
    textAlign: 'center',
  },
  arrow: {
    fontSize: 16,
    color: theme.Colors.textSecondary ?? '#666666',
    marginVertical: 2,
  },
  continueButton: {
    marginTop: theme.Spacing?.lg ?? 24,
    alignSelf: 'stretch',
    height: theme.Layout?.buttonHeight ?? 48,
    borderRadius: theme.Radius?.full ?? 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontFamily: theme.FontFamily?.semiBold,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontSize: theme.FontSize?.base ?? 14,
    color: theme.Colors.textInverse ?? '#FFFFFF',
  },
});

export default memo(ActivationSuccessCard);
