/**
 * Android-safe wrapper around ImagePicker.launchImageLibraryAsync.
 *
 * On Android, expo-image-picker uses ActivityResultLauncher. Launching it while
 * an Alert/dialog is dismissing (or before the host Activity is fully resumed)
 * throws IllegalStateException: "Attempting to launch an unregistered
 * ActivityResultLauncher". iOS uses PHPicker and is left unchanged.
 */

import * as ImagePicker from 'expo-image-picker';
import { InteractionManager, Platform } from 'react-native';

const ANDROID_ACTIVITY_READY_MS = 350;

const waitForAndroidActivityReady = () =>
  new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(resolve, ANDROID_ACTIVITY_READY_MS);
    });
  });

const isUnregisteredLauncherError = (error) => {
  const msg = String(error?.message ?? error ?? '');
  return (
    msg.includes('ActivityResultLauncher') ||
    msg.includes('unregistered') ||
    msg.includes('launchImageLibraryAsync')
  );
};

/**
 * @param {import('expo-image-picker').ImagePickerOptions} [options]
 * @returns {Promise<import('expo-image-picker').ImagePickerResult>}
 */
export const launchImageLibrarySafely = async (options = {}) => {
  if (Platform.OS === 'android') {
    await waitForAndroidActivityReady();
  }

  try {
    return await ImagePicker.launchImageLibraryAsync(options);
  } catch (error) {
    if (Platform.OS === 'android' && isUnregisteredLauncherError(error)) {
      // One retry after the Activity / registry has another chance to settle.
      await waitForAndroidActivityReady();
      return ImagePicker.launchImageLibraryAsync(options);
    }
    throw error;
  }
};
