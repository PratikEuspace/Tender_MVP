import Ionicons from '@expo/vector-icons/Ionicons';
import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import theme from '../theme';

const PRIMARY = theme.Colors.primary ?? '#062E52';

const UploadSourceSheetContent = ({
  title,
  photoLabel,
  filesLabel,
  cancelLabel,
  onSelectPhoto,
  onSelectFiles,
  onCancel,
  overlayOpacity,
  sheetTranslate,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityRole="button" />

      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            transform: [{ translateY: sheetTranslate }],
          },
        ]}
      >
        <View style={styles.handle} />
        {title ? <Text style={styles.title}>{title}</Text> : null}

        <TouchableOpacity
          style={styles.option}
          onPress={onSelectPhoto}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel={photoLabel}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="images-outline" size={22} color={PRIMARY} />
          </View>
          <Text style={styles.optionText}>{photoLabel}</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={onSelectFiles}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel={filesLabel}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="folder-open-outline" size={22} color={PRIMARY} />
          </View>
          <Text style={styles.optionText}>{filesLabel}</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        >
          <Text style={styles.cancelText}>{cancelLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

/**
 * Android upload-source bottom sheet (Photo Library | Files | Cancel).
 * iOS continues to use ActionSheetIOS via uploadSourceSheet.js.
 */
const UploadSourceSheet = ({
  visible,
  title,
  photoLabel,
  filesLabel,
  cancelLabel,
  onSelectPhoto,
  onSelectFiles,
  onCancel,
}) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (!visible) {
      overlayOpacity.setValue(0);
      sheetTranslate.setValue(40);
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslate, {
        toValue: 0,
        friction: 9,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, overlayOpacity, sheetTranslate]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* Modal is a separate native window — nest SafeAreaProvider like SettingsDrawer. */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <UploadSourceSheetContent
          title={title}
          photoLabel={photoLabel}
          filesLabel={filesLabel}
          cancelLabel={cancelLabel}
          onSelectPhoto={onSelectPhoto}
          onSelectFiles={onSelectFiles}
          onCancel={onCancel}
          overlayOpacity={overlayOpacity}
          sheetTranslate={sheetTranslate}
        />
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: theme.Colors.white ?? '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.Spacing?.lg ?? 20,
    paddingTop: 10,
    ...theme.Shadow?.card,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 14,
  },
  title: {
    fontFamily: theme.FontFamily?.semiBold,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontSize: theme.FontSize?.md ?? 16,
    color: theme.Colors.textPrimary ?? '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.Colors.borderSubtle ?? '#E5E7EB',
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.Colors.primaryFaint ?? '#EDF5FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontFamily: theme.FontFamily?.medium,
    fontWeight: theme.FontWeight?.medium ?? '500',
    fontSize: theme.FontSize?.base ?? 15,
    color: theme.Colors.textPrimary ?? '#1A1A1A',
  },
  cancelButton: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: theme.Radius?.button ?? 10,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.Colors.white ?? '#FFFFFF',
  },
  cancelText: {
    fontFamily: theme.FontFamily?.semiBold,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontSize: theme.FontSize?.base ?? 15,
    color: PRIMARY,
  },
});

export default memo(UploadSourceSheet);
