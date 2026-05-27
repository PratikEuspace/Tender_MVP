/**
 * iOS-only: paint the native root window and align navigator surfaces so
 * status-bar / home-indicator regions show navy instead of default white.
 * Android is never called.
 */
import { Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';

const IOS_ROOT_BG = '#062E52';

export function configureIosEdgeToEdge() {
  if (Platform.OS !== 'ios') {
    return;
  }
  void SystemUI.setBackgroundColorAsync(IOS_ROOT_BG);
}
