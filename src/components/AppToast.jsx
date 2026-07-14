import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import theme from '../theme';

const PRIMARY = theme.Colors.primary ?? '#062E52';
const DEFAULT_DURATION_MS = 3500;
const ICON_SIZE = 20;

const AppToast = ({
  visible,
  message,
  position = 'bottom',
  icon = null,
  duration = DEFAULT_DURATION_MS,
  onHide,
}) => {
  const insets = useSafeAreaInsets();
  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || !message) {
      toastAnim.setValue(0);
      return undefined;
    }

    toastAnim.setValue(0);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onHide?.();
        }
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, message, onHide, toastAnim, visible]);

  if (!visible || !message) return null;

  const isTop = position === 'top';
  const edgeStyle = isTop
    ? { top: insets.top + (theme.Spacing?.sm ?? 12) }
    : { bottom: insets.bottom + (theme.Spacing?.lg ?? 20) };

  const slideOffset = isTop ? -24 : 24;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        edgeStyle,
        {
          opacity: toastAnim,
          transform: [
            {
              translateY: toastAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [slideOffset, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.toastContent}>
        {icon ? (
          <Ionicons name={icon} size={ICON_SIZE} color={PRIMARY} />
        ) : null}
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: theme.Spacing?.lg ?? 20,
    right: theme.Spacing?.lg ?? 20,
    zIndex: theme.ZIndex?.toast ?? 500,
    backgroundColor: theme.Colors.surface ?? '#FFFFFF',
    borderRadius: theme.Radius?.md ?? 10,
    borderWidth: 2,
    borderColor: PRIMARY,
    paddingHorizontal: theme.Spacing?.md ?? 16,
    paddingVertical: (theme.Spacing?.sm ?? 8) + 2,
    ...theme.Shadow?.card,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.Spacing?.sm ?? 12,
  },
  toastText: {
    flex: 1,
    fontFamily: theme.FontFamily?.medium,
    fontWeight: theme.FontWeight?.medium ?? '500',
    fontSize: theme.FontSize?.sm ?? 14,
    color: PRIMARY,
    lineHeight: 20,
  },
});

export default AppToast;
