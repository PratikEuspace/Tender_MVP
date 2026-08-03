// src/hooks/useSaveAndContinue.js
//
// Bridge: form → SQLite → advance workflow_step → navigate.
//
//   screenKey    — useDraftStore key
//   persistFn    — async (workId, formData) => workId
//   nextRoute    — where to go after save
//   currentRoute — THIS screen's route (used to mark completed step id)

import { CommonActions } from '@react-navigation/native';
import { useCallback } from 'react';
import useWorkStore from '../store/useWorkStore';
import useDraftStore from '../store/useDraftStore';
import useUIStore from '../store/useUIStore';
import { advanceWorkflowStep } from '../db/repositories/worksRepository';
import { getStepByRoute } from '../constants/WorkflowSteps';
import { WORKS_ROUTES } from '../navigation/worksRoutes';
import { translatePersistError } from '../i18n/persistErrors';

const useSaveAndContinue = (screenKey, persistFn, nextRoute, currentRoute) => {
  const { currentWorkId, setCurrentWorkId, refreshCurrentWork } = useWorkStore();
  const { clearDraft } = useDraftStore();
  const { isSaving, setSaving } = useUIStore();

  const saveAndContinue = useCallback(
    async (formData, navigation, options = {}) => {
      const {
        onValidationFail,
        popToTop = false,
        exitToWorksList = false,
      } = options;

      if (isSaving) return;

      setSaving(true);

      try {
        const persistResult = await persistFn(currentWorkId, formData);

        // Prefer store id when editing — repos must return workId, but never use
        // a child-table row id (e.g. contractors.id) for workflow_step updates.
        const resolvedWorkId = currentWorkId ?? persistResult;

        if (!currentWorkId && persistResult) {
          await setCurrentWorkId(persistResult);
        }

        const completedStepId = currentRoute
          ? getStepByRoute(currentRoute)?.id ?? null
          : null;

        if (resolvedWorkId && completedStepId) {
          advanceWorkflowStep(resolvedWorkId, completedStepId);
        }

        await refreshCurrentWork();
        clearDraft(screenKey, resolvedWorkId ?? undefined);

        // Bill Submission leaves the nested Workflow stack and lands on Works list.
        if (exitToWorksList) {
          const parent = navigation.getParent();
          if (parent) {
            parent.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: WORKS_ROUTES.LIST }],
              }),
            );
          } else {
            navigation.popToTop();
          }
        } else if (popToTop) {
          // Collapse nested stack to hub (no duplicate AddWork push).
          navigation.popToTop();
        } else {
          navigation.navigate(nextRoute);
        }
      } catch (error) {
        console.error(`[useSaveAndContinue] ${screenKey} save failed:`, error);
        if (typeof onValidationFail === 'function') {
          onValidationFail(translatePersistError(error.message));
        }
      } finally {
        setSaving(false);
      }
    },
    [
      screenKey,
      persistFn,
      nextRoute,
      currentRoute,
      currentWorkId,
      isSaving,
      setSaving,
      setCurrentWorkId,
      refreshCurrentWork,
      clearDraft,
    ],
  );

  return {
    saveAndContinue,
    isSaving,
  };
};

export default useSaveAndContinue;
