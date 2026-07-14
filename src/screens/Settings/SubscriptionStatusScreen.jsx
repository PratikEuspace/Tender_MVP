import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import ScreenLayout from '../../components/layouts/Screenlayout';
import { isSubscriptionExpired } from '../../services/subscriptionService';
import useAuthStore from '../../store/useAuthStore';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '../../theme';
import { getSubscriptionRemainingDetailText } from '../../utils/subscriptionDisplay';

const STATUS_GREEN = '#22C55E';

const SubscriptionStatusScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation('settings');
  const isActivated = useAuthStore((state) => state.isActivated);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const name = useAuthStore((state) => state.name);

  const displayName = (name ?? '').trim() || t('subscription.unknownName');

  const { statusLabel, isActive, remainingText } = useMemo(() => {
    if (!isActivated || !expiresAt) {
      return {
        statusLabel: t('subscription.inactive'),
        isActive: false,
        remainingText: t('subscription.noValidity'),
      };
    }

    const expired = isSubscriptionExpired(expiresAt);
    if (expired) {
      return {
        statusLabel: t('subscription.expired'),
        isActive: false,
        remainingText: t('subscription.noValidity'),
      };
    }

    const detail = getSubscriptionRemainingDetailText(expiresAt);
    return {
      statusLabel: t('subscription.active'),
      isActive: true,
      remainingText: detail || t('subscription.noValidity'),
    };
  }, [expiresAt, i18n.language, isActivated, t]);

  return (
    <ScreenLayout
      title={t('subscription.screenTitle')}
      showBack
      onBackPress={() => navigation.goBack()}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('subscription.nameLabel')}</Text>
        <Text style={styles.nameValue} numberOfLines={2}>
          {displayName}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('subscription.statusLabel')}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusValue}>{statusLabel}</Text>
          {isActive ? (
            <View style={styles.liveDotWrap}>
              <View style={styles.liveDotGlow} />
              <View style={styles.liveDot} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('subscription.validityLabel')}</Text>
        <Text style={styles.validityValue}>{remainingText}</Text>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing?.md ?? 16,
  },
  card: {
    backgroundColor: Colors.white ?? '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderDefault ?? '#E4E4E4',
    borderRadius: 12,
    paddingVertical: Spacing?.lg ?? 18,
    paddingHorizontal: Spacing?.lg ?? 18,
    marginBottom: Spacing?.md ?? 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontFamily: FontFamily?.medium,
    fontWeight: FontWeight?.medium ?? '500',
    fontSize: FontSize?.sm ?? 13,
    color: Colors.textSecondary ?? '#666666',
    marginBottom: Spacing?.sm ?? 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusValue: {
    fontFamily: FontFamily?.bold,
    fontWeight: FontWeight?.bold ?? '700',
    fontSize: FontSize?.xl ?? 22,
    color: Colors.textPrimary ?? '#1A1A1A',
  },
  nameValue: {
    fontFamily: FontFamily?.semiBold,
    fontWeight: FontWeight?.semiBold ?? '600',
    fontSize: FontSize?.lg ?? 18,
    color: Colors.textPrimary ?? '#1A1A1A',
    lineHeight: 26,
  },
  liveDotWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotGlow: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: STATUS_GREEN,
    opacity: 0.35,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: STATUS_GREEN,
    shadowColor: STATUS_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 6,
    elevation: 4,
  },
  validityValue: {
    fontFamily: FontFamily?.semiBold,
    fontWeight: FontWeight?.semiBold ?? '600',
    fontSize: FontSize?.lg ?? 18,
    color: Colors.primary ?? '#062E52',
    lineHeight: 26,
  },
});

export default SubscriptionStatusScreen;
