import Ionicons from '@expo/vector-icons/Ionicons';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import theme from '../theme';

const PRIMARY = theme.Colors.primary ?? '#062E52';
const ICON_SIZE = 44;

const TYPE_ICONS = {
  confirmation: 'help-circle-outline',
  success: 'checkmark-circle-outline',
  error: 'close-circle-outline',
  warning: 'warning-outline',
  info: 'information-circle-outline',
};

const AppDialog = ({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'No',
  loading = false,
  icon = null,
  dismissOnBackdropPress = false,
  onConfirm,
  onCancel,
}) => {
  const isConfirmation = type === 'confirmation';
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    if (!visible) {
      overlayOpacity.setValue(0);
      cardScale.setValue(0.94);
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, cardScale, overlayOpacity]);

  const defaultIcon = useMemo(() => {
    const iconName = TYPE_ICONS[type] ?? TYPE_ICONS.info;
    return <Ionicons name={iconName} size={ICON_SIZE} color={PRIMARY} />;
  }, [type]);

  const handleBackdropPress = () => {
    if (dismissOnBackdropPress && !loading) {
      onCancel?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {
        if (!loading) onCancel?.();
      }}
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={styles.overlayPress} onPress={handleBackdropPress}>
          <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
            <View onStartShouldSetResponder={() => true}>
              <View style={styles.iconWrap}>{icon ?? defaultIcon}</View>

              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              {isConfirmation ? (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                    disabled={loading}
                    activeOpacity={0.82}
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton, loading && styles.buttonDisabled]}
                    onPress={onConfirm}
                    disabled={loading}
                    activeOpacity={0.82}
                    accessibilityRole="button"
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={theme.Colors.white ?? '#FFFFFF'} />
                    ) : (
                      <Text style={styles.confirmButtonText}>{confirmText}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton, styles.singleButton, loading && styles.buttonDisabled]}
                  onPress={onConfirm}
                  disabled={loading}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.Colors.white ?? '#FFFFFF'} />
                  ) : (
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayPress: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.Spacing?.lg ?? 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.Colors.white ?? '#FFFFFF',
    borderRadius: theme.Radius?.xl ?? 18,
    paddingHorizontal: theme.Spacing?.lg ?? 20,
    paddingTop: theme.Spacing?.xl ?? 24,
    paddingBottom: theme.Spacing?.lg ?? 20,
    ...theme.Shadow?.card,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: theme.Spacing?.md ?? 12,
  },
  title: {
    fontFamily: theme.FontFamily?.bold,
    fontWeight: theme.FontWeight?.bold ?? '700',
    fontSize: theme.FontSize?.lg ?? 17,
    color: theme.Colors.textPrimary ?? '#1A1A1A',
    textAlign: 'center',
    marginBottom: theme.Spacing?.sm ?? 8,
  },
  message: {
    fontFamily: theme.FontFamily?.regular,
    fontSize: theme.FontSize?.sm ?? 14,
    fontWeight: theme.FontWeight?.regular ?? '400',
    color: theme.Colors.textSecondary ?? '#666666',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: theme.Spacing?.lg ?? 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.Spacing?.sm ?? 10,
  },
  button: {
    flex: 1,
    minHeight: theme.Layout?.buttonHeightSm ?? 44,
    borderRadius: theme.Radius?.button ?? 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.Spacing?.sm ?? 8,
  },
  singleButton: {
    flex: 0,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: theme.Colors.white ?? '#FFFFFF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  cancelButtonText: {
    fontFamily: theme.FontFamily?.semiBold,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontSize: theme.FontSize?.base ?? 15,
    color: PRIMARY,
  },
  confirmButton: {
    backgroundColor: PRIMARY,
  },
  confirmButtonText: {
    fontFamily: theme.FontFamily?.semiBold,
    fontWeight: theme.FontWeight?.semiBold ?? '600',
    fontSize: theme.FontSize?.base ?? 15,
    color: theme.Colors.white ?? '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.85,
  },
});

export default memo(AppDialog);
