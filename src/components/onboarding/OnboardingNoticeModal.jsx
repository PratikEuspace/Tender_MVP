import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

/**
 * Scrollable notice modal for onboarding legal/privacy content.
 * Opening/closing does not affect checkbox state on the parent screen.
 */
const OnboardingNoticeModal = ({
  visible,
  title,
  body = '',
  closeLabel,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const hasBody = typeof body === 'string' && body.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />

        <View
          style={[
            styles.card,
            {
              maxHeight: Layout.screenHeight * 0.78,
              marginBottom: Math.max(insets.bottom, Spacing.md),
            },
          ]}
        >
          <Text style={styles.title}>{title}</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            bounces={false}
          >
            {hasBody ? (
              <Text style={styles.body}>{body}</Text>
            ) : null}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
          >
            <Text style={styles.closeButtonText}>{closeLabel}</Text>
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
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    ...Shadow.card,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: Typography.h3.fontSize,
    lineHeight: Typography.h3.lineHeight,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: Spacing.sm,
    minHeight: Spacing.sm,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight + 4,
    color: Colors.textPrimary,
  },
  closeButton: {
    marginTop: Spacing.md,
    height: Layout.buttonHeight,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeight.semiBold,
    fontSize: Typography.buttonText.fontSize,
    letterSpacing: Typography.buttonText.letterSpacing,
    color: Colors.textInverse,
  },
});

export default OnboardingNoticeModal;
