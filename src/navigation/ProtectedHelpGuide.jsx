import React from 'react';

import AuthGate from '../components/auth/AuthGate';
import HelpGuideScreen from '../screens/Settings/HelpGuideScreen';

const ProtectedHelpGuide = ({ navigation }) => (
  <AuthGate navigation={navigation}>
    <HelpGuideScreen navigation={navigation} />
  </AuthGate>
);

export default ProtectedHelpGuide;
