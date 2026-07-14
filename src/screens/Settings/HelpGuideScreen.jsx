import { useTranslation } from 'react-i18next';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import ScreenLayout from '../../components/layouts/Screenlayout';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '../../theme';

const SUPPORT_EMAIL = 'wardvikas@euspacetech.com';
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;
const GUIDE_STEP_COUNT = 10;

const HelpGuideScreen = ({ navigation }) => {
  const { t } = useTranslation('settings');

  const guideSteps = Array.from({ length: GUIDE_STEP_COUNT }, (_, index) =>
    t(`help.guide.steps.${index + 1}`),
  );

  const handleEmailPress = () => {
    Linking.openURL(SUPPORT_MAILTO).catch(() => {});
  };

  return (
    <ScreenLayout
      title={t('help.title')}
      showBack
      onBackPress={() => navigation.goBack()}
      scrollable
      contentStyle={styles.content}
    >
      <View style={styles.contactCard}>
        <Text style={styles.needHelp}>{t('help.needHelp')}</Text>
        <TouchableOpacity
          onPress={handleEmailPress}
          activeOpacity={0.75}
          hitSlop={8}
          accessibilityRole="link"
          accessibilityLabel={SUPPORT_EMAIL}
        >
          <Text style={styles.email}>{SUPPORT_EMAIL}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>{t('help.guide.title')}</Text>

        <View style={styles.steps}>
          {guideSteps.map((step, index) => (
            <View key={`guide-step-${index + 1}`} style={styles.stepRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.primary}
                style={styles.stepIcon}
              />
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  contactCard: {
    backgroundColor: Colors.white ?? '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderDefault ?? '#E4E4E4',
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  needHelp: {
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeight.semiBold,
    fontSize: FontSize.md ?? 16,
    color: Colors.textPrimary ?? '#1A1A1A',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  email: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base ?? 14,
    color: Colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  guideCard: {
    backgroundColor: Colors.white ?? '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderDefault ?? '#E4E4E4',
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  guideTitle: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg ?? 18,
    color: Colors.primary ?? '#062E52',
    marginBottom: Spacing.md,
  },
  steps: {
    gap: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepIcon: {
    marginTop: 1,
  },
  stepText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base ?? 14,
    lineHeight: 22,
    color: Colors.textPrimary ?? '#1A1A1A',
  },
});

export default HelpGuideScreen;
