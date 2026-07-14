import React from 'react';

import AuthGate from '../components/auth/AuthGate';
import SubscriptionStatusScreen from '../screens/Settings/SubscriptionStatusScreen';

const ProtectedSubscriptionStatus = ({ navigation }) => (
  <AuthGate navigation={navigation}>
    <SubscriptionStatusScreen navigation={navigation} />
  </AuthGate>
);

export default ProtectedSubscriptionStatus;
