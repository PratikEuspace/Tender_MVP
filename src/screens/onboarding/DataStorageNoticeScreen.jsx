import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import OnboardingNoticeModal from '../../components/onboarding/OnboardingNoticeModal';
import {
  Colors,
  FontFamily,
  FontWeight,
  Layout,
  Radius,
  Shadow,
  Spacing,
  Typography,
} from '../../theme';

const ARC_LG = Layout.screenWidth * 1.55;
const ARC_MD = Layout.screenWidth * 1.25;
const CHECKBOX_SIZE = 22;

const DataStorageNoticeScreen = ({ navigation }) => {
  const { t } = useTranslation('onboarding');
  const insets = useSafeAreaInsets();
  const [understood, setUnderstood] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  const canContinue = understood && agreed;

  return (
    <View style={styles.container}>
      <View style={styles.arcTopRight} />
      <View style={styles.arcBottomLeft} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.md,
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>{t('dataStorage.title')}</Text>
          <Text style={styles.body}>{t('dataStorage.body')}</Text>

          <View style={styles.checkboxGroup}>
            <CheckboxRow
              checked={understood}
              label={t('dataStorage.understand')}
              linkLabel={t('dataStorage.privacyLink')}
              onToggle={() => setUnderstood((value) => !value)}
              onLinkPress={() => setPrivacyVisible(true)}
            />
            <CheckboxRow
              checked={agreed}
              label={t('dataStorage.agree')}
              linkLabel={t('dataStorage.termsLink')}
              onToggle={() => setAgreed((value) => !value)}
              onLinkPress={() => setTermsVisible(true)}
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={() => {
            if (!canContinue) return;
            navigation.replace('Activation');
          }}
          activeOpacity={canContinue ? 0.82 : 1}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel={t('dataStorage.continue')}
          accessibilityState={{ disabled: !canContinue }}
        >
          <Text style={styles.continueButtonText}>
            {t('dataStorage.continue')}
          </Text>
        </TouchableOpacity>
      </View>

      <OnboardingNoticeModal
        visible={privacyVisible}
        title={t('dataStorage.privacyTitle')}
        body={t('dataStorage.privacyBody')}
        closeLabel={t('dataStorage.close')}
        onClose={() => setPrivacyVisible(false)}
      />

      <OnboardingNoticeModal
        visible={termsVisible}
        title={t('dataStorage.termsTitle')}
        body={t('dataStorage.termsBody')}
        closeLabel={t('dataStorage.close')}
        onClose={() => setTermsVisible(false)}
      />
    </View>
  );
};

const CheckboxRow = ({
  checked,
  label,
  linkLabel,
  onToggle,
  onLinkPress,
}) => (
  <View style={styles.checkboxRow}>
    <Pressable
      onPress={onToggle}
      style={styles.checkboxHit}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? (
          <Ionicons name="checkmark" size={16} color={Colors.primary} />
        ) : null}
      </View>
    </Pressable>

    <View style={styles.labelRow}>
      <Text style={styles.checkboxLabel}>{label}</Text>
      <Pressable
        onPress={onLinkPress}
        hitSlop={8}
        accessibilityRole="link"
        accessibilityLabel={linkLabel}
      >
        <Text style={styles.linkText}>{linkLabel}</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  arcTopRight: {
    position: 'absolute',
    width: ARC_LG,
    height: ARC_LG,
    borderRadius: ARC_LG / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    top: -(ARC_LG * 0.42),
    right: -(ARC_LG * 0.38),
  },
  arcBottomLeft: {
    position: 'absolute',
    width: ARC_MD,
    height: ARC_MD,
    borderRadius: ARC_MD / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    bottom: -(ARC_MD * 0.52),
    left: -(ARC_MD * 0.28),
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: Typography.h2.fontSize,
    lineHeight: Typography.h2.lineHeight,
    color: Colors.textInverse,
    marginBottom: Spacing.md,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight + 4,
    color: Colors.textInverse,
    opacity: 0.9,
    marginBottom: Spacing.xl,
  },
  checkboxGroup: {
    gap: Spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  checkboxHit: {
    paddingTop: 2,
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.textInverse,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surface,
  },
  labelRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing.sm,
    rowGap: Spacing.xs,
    paddingTop: 2,
  },
  checkboxLabel: {
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    color: Colors.textInverse,
  },
  linkText: {
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    color: Colors.textInverse,
    textDecorationLine: 'underline',
    flexShrink: 1,
  },
  continueButton: {
    width: '100%',
    height: Layout.buttonHeight,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueButtonText: {
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeight.semiBold,
    fontSize: Typography.buttonText.fontSize,
    letterSpacing: Typography.buttonText.letterSpacing,
    color: Colors.primary,
  },
});

export default DataStorageNoticeScreen;
