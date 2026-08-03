import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SubscriptionExpiryHandler from './src/components/auth/SubscriptionExpiryHandler';
import { AppDialogProvider } from './src/context/AppDialogProvider';
import { UploadSourceSheetProvider } from './src/context/UploadSourceSheetProvider';
import { initDatabase } from './src/db/database';
import { initI18n } from './src/i18n';
import { configureIosEdgeToEdge } from './src/navigation/configureIosEdgeToEdge';
import { navigationRef } from './src/navigation/navigationRef';
import RootNavigator from './src/navigation/RootNavigator';

// Preserve modest Dynamic Type support while preventing iOS accessibility sizes
// from overflowing the app's compact enterprise layouts. Android keeps its
// native font-scaling behavior unchanged.
if (Platform.OS === 'ios') {
  Text.defaultProps = {
    ...Text.defaultProps,
    maxFontSizeMultiplier: 1.15,
  };
  TextInput.defaultProps = {
    ...TextInput.defaultProps,
    maxFontSizeMultiplier: 1.15,
  };
}

/**
 * Production app entry (expo/AppEntry → App.js).
 * React Navigation root — not expo-router file-based routing.
 */
export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([initDatabase(), initI18n()])
      .then(() => {
        configureIosEdgeToEdge();
        setReady(true);
      })
      .catch((error) => {
        console.error('[App] Startup failed:', error);
        configureIosEdgeToEdge();
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator size="large" color="#062E52" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef}>
        <AppDialogProvider>
          <UploadSourceSheetProvider>
            <RootNavigator />
            <SubscriptionExpiryHandler />
          </UploadSourceSheetProvider>
        </AppDialogProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
