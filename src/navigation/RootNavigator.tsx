// src/navigation/RootNavigator.js
//
// ─────────────────────────────────────────────────────────────────────────────
//  NAVIGATION FLOW
//
//    SplashGradient  (1 s)
//         ↓  replace
//    SplashLoader    (1.5 s + auth hydrate)
//         ↓  replace
//    Welcome                  ┐
//         ↓  replace          │  only when session is invalid
//    DataStorageNotice        │  (every launch until activated)
//         ↓  replace          ┘
//    Activation
//         ↓  replace  (on successful activation)
//    MainApp
//
//    Already activated → SplashLoader → MainApp
//    Logout / expiry   → resetToActivation() → Activation only
//
//  All transitions use navigation.replace() so the back-stack stays clean.
// ─────────────────────────────────────────────────────────────────────────────

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import ActivationScreen from '../screens/splash/ActivationScreen';
import GradientSplashScreen from '../screens/splash/Gradientsplashscreen';
import LoaderSplashScreen from '../screens/splash/Loadersplashscreen';
import DataStorageNoticeScreen from '../screens/onboarding/DataStorageNoticeScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import ProtectedGeneralCorrespondence from './ProtectedGeneralCorrespondence';
import ProtectedHelpGuide from './ProtectedHelpGuide';
import ProtectedMainApp from './ProtectedMainApp';
import ProtectedSubscriptionStatus from './ProtectedSubscriptionStatus';
import { Colors } from '../theme';

const Root = createNativeStackNavigator();

const RootNavigator = () => (
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <Root.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
        contentStyle: { backgroundColor: Colors.bgScreen },
      }}
    >
      {/* ── Pre-auth / onboarding flow ──────────────────────────────────────── */}
      <Root.Screen name="SplashGradient" component={GradientSplashScreen} />
      <Root.Screen name="SplashLoader" component={LoaderSplashScreen} />
      <Root.Screen name="Welcome" component={WelcomeScreen} />
      <Root.Screen name="DataStorageNotice" component={DataStorageNoticeScreen} />
      <Root.Screen name="Activation" component={ActivationScreen} />

      {/* ── Main app ────────────────────────────────────────────────────────── */}
      <Root.Screen
        name="MainApp"
        component={ProtectedMainApp}
        options={
          Platform.OS === 'ios'
            ? {
                contentStyle: { backgroundColor: Colors.primary },
              }
            : undefined
        }
      />

      <Root.Screen
        name="GeneralCorrespondence"
        component={ProtectedGeneralCorrespondence}
        options={{ animation: 'slide_from_right' }}
      />

      <Root.Screen
        name="SubscriptionStatus"
        component={ProtectedSubscriptionStatus}
        options={{ animation: 'slide_from_right' }}
      />

      <Root.Screen
        name="HelpGuide"
        component={ProtectedHelpGuide}
        options={{ animation: 'slide_from_right' }}
      />
    </Root.Navigator>
  </SafeAreaProvider>
);

export default RootNavigator;
