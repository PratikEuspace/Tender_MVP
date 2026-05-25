import { Keyboard, Platform } from 'react-native';

/** Dismiss the software keyboard immediately. */
export const dismissKeyboard = () => {
  Keyboard.dismiss();
};

/**
 * Dismiss after closing a modal/popover.
 * Android often refocuses the last TextInput when a Modal closes — run dismiss again
 * on the next frame (and once more on Android) to prevent keyboard reopening.
 */
export const dismissKeyboardAfterClose = () => {
  Keyboard.dismiss();
  requestAnimationFrame(() => {
    Keyboard.dismiss();
  });
  if (Platform.OS === 'android') {
    setTimeout(() => Keyboard.dismiss(), 64);
  }
};

/** Call before opening a dropdown/calendar so the keyboard stays down. */
export const dismissKeyboardBeforeOverlay = () => {
  Keyboard.dismiss();
};
