// Works tab stack — list + nested workflow (replaces the Add Work bottom tab).

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import WorksScreen from '../screens/Works/WorksScreen';
import { Colors } from '../theme';
import WorkflowNavigator from './WorkflowNavigator';
import { WORKS_ROUTES } from './worksRoutes';

export { WORKS_ROUTES, openWorkflowHubParams } from './worksRoutes';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: Colors.bgScreen },
};

const WorksNavigator = () => (
  <Stack.Navigator
    initialRouteName={WORKS_ROUTES.LIST}
    screenOptions={SCREEN_OPTIONS}
  >
    <Stack.Screen name={WORKS_ROUTES.LIST} component={WorksScreen} />
    <Stack.Screen name={WORKS_ROUTES.WORKFLOW} component={WorkflowNavigator} />
  </Stack.Navigator>
);

export default WorksNavigator;
