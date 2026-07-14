import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

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

const FEATURE_KEYS = [
  'offlineFirst',
  'secureStorage',
  'workflowTracking',
  'fyReports',
];

const ARC_LG = Layout.screenWidth * 1.55;
const ARC_MD = Layout.screenWidth * 1.25;

const WelcomeScreen = ({ navigation }) => {
  const { t } = useTranslation('onboarding');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.arcTopRight} />
      <View style={styles.arcBottomLeft} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.md,
          },
        ]}
      >
        <View style={styles.hero}>
          <Text style={styles.greeting}>{t('welcome.greeting')}</Text>
          <Text style={styles.brandName}>{t('welcome.brandName')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        </View>

        <View style={styles.featureList}>
          {FEATURE_KEYS.map((key) => (
            <View key={key} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.textInverse}
              />
              <Text style={styles.featureText}>
                {t(`welcome.features.${key}`)}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.replace('DataStorageNotice')}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={t('welcome.continue')}
        >
          <Text style={styles.continueButtonText}>{t('welcome.continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: Spacing.xxl,
  },
  greeting: {
    fontFamily: FontFamily.regular,
    fontSize: Typography.h3.fontSize,
    lineHeight: Typography.h3.lineHeight,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  brandName: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: Typography.h1.fontSize,
    lineHeight: Typography.h1.lineHeight,
    color: Colors.textInverse,
  },
  subtitle: {
    marginTop: Spacing.md,
    fontFamily: FontFamily.regular,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight + 4,
    color: Colors.textInverse,
    opacity: 0.88,
  },
  featureList: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    color: Colors.textInverse,
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
  continueButtonText: {
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeight.semiBold,
    fontSize: Typography.buttonText.fontSize,
    letterSpacing: Typography.buttonText.letterSpacing,
    color: Colors.primary,
  },
});

export default WelcomeScreen;
