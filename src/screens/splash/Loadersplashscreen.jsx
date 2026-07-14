// src/screens/splash/LoaderSplashScreen.js
//
// Shows brand splash content, then routes:
//   valid session → MainApp
//   otherwise     → Welcome (onboarding)

import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/useAuthStore';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  Spacing,
  Typography,
} from '../../theme';

const LOGO_SIZE = 120;
const TITLE_FONT_SIZE = FontSize.h2 + 4; // 36
const TITLE_LINE_HEIGHT = Math.round(TITLE_FONT_SIZE * LineHeight.tight);
const TITLE_LETTER_SPC = +(TITLE_FONT_SIZE * 0.11).toFixed(2);

const LoaderSplashScreen = ({ navigation }) => {
  const { t } = useTranslation('onboarding');

  useEffect(() => {
    let cancelled = false;

    const navigateNext = () => {
      if (cancelled) return;
      const isValid = useAuthStore.getState().isSessionValid();
      navigation.replace(isValid ? 'MainApp' : 'Welcome');
    };

    const waitForHydration = () =>
      new Promise((resolve) => {
        if (useAuthStore.persist.hasHydrated()) {
          resolve();
          return;
        }
        const unsub = useAuthStore.persist.onFinishHydration(() => {
          unsub();
          resolve();
        });
      });

    const minSplash = new Promise((resolve) => setTimeout(resolve, 1500));

    Promise.all([minSplash, waitForHydration()]).then(navigateNext);

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <Text style={styles.brandName}>{t('splash.brandName')}</Text>
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
        <Text style={styles.poweredBy}>{t('splash.poweredBy')}</Text>
        <Text style={styles.loading}>{t('splash.loading')}</Text>

        <ActivityIndicator
          size={40}
          color={Colors.textInverse}
          style={styles.spinner}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginBottom: Spacing.lg,
  },
  brandName: {
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeight.semiBold,
    fontSize: TITLE_FONT_SIZE,
    lineHeight: TITLE_LINE_HEIGHT,
    letterSpacing: TITLE_LETTER_SPC,
    color: Colors.textInverse,
    textAlign: 'center',
  },
  tagline: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    color: Colors.textInverse,
    textAlign: 'center',
    opacity: 0.92,
  },
  poweredBy: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: Typography.bodySm.fontSize,
    lineHeight: Typography.bodySm.lineHeight,
    color: Colors.textInverse,
    textAlign: 'center',
    opacity: 0.75,
  },
  loading: {
    marginTop: Spacing.xl,
    fontFamily: FontFamily.regular,
    fontSize: Typography.bodySm.fontSize,
    color: Colors.textInverse,
    textAlign: 'center',
    opacity: 0.85,
  },
  spinner: {
    marginTop: Spacing.md,
  },
});

export default LoaderSplashScreen;
