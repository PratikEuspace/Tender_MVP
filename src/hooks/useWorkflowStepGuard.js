// src/hooks/useWorkflowStepGuard.js
//
// Redirects to Add Work hub when user opens a locked workflow screen
// (step.id > works.workflow_step). Step 1 is always allowed (creates work).

import { useEffect } from 'react';
import { getWorkById } from '../db/repositories/worksRepository';
import useWorkStore from '../store/useWorkStore';
import {
  getStepByRoute,
  WORKFLOW_ROUTES,
} from '../constants/WorkflowSteps';

const useWorkflowStepGuard = (routeName, navigation) => {
  const { currentWorkId, currentWork } = useWorkStore();

  useEffect(() => {
    const check = () => {
      const step = getStepByRoute(routeName);
      if (!step) return;

      if (step.id === 1) return;

      if (!currentWorkId) {
        navigation.replace(WORKFLOW_ROUTES.ADD_WORK);
        return;
      }

      // Read SQLite on focus so guard sees workflow_step after Save & Continue
      // even if Zustand has not rehydrated yet.
      const workflowStep =
        getWorkById(currentWorkId)?.workflow_step ??
        currentWork?.workflow_step ??
        1;
      if (step.id > workflowStep) {
        navigation.replace(WORKFLOW_ROUTES.ADD_WORK);
      }
    };

    const unsubscribe = navigation.addListener('focus', check);
    check();
    return unsubscribe;
  }, [routeName, navigation, currentWorkId, currentWork?.workflow_step]);
};

export default useWorkflowStepGuard;
