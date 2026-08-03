// src/screens/AddWork/AddWorkScreen.jsx
//
// Workflow hub — lists all steps as tappable NavigationCards.
// Opened from Works (Start New Work / existing card); not a bottom tab.
//
// Card state from works.workflow_step (see deriveStepStatus):
//   completed — step saved via Save & Continue (green check)
//   pending   — current step, not yet advanced (yellow indicator)
//   locked    — future steps (grey lock, not tappable)

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ScreenLayout from '../../components/layouts/Screenlayout';
import NavigationCard from '../../components/Navigationcard';
import WorkflowStepBadge from '../../components/workflow/WorkflowStepBadge';

import useWorkStore from '../../store/useWorkStore';

import {
  Colors,
  FontFamily,
  FontWeight,
  Spacing,
} from '../../theme';

import {
  WORKFLOW_STEPS,
  deriveStepStatus,
  WORKFLOW_ALL_COMPLETE_STEP,
} from '../../constants/WorkflowSteps';
import { getStepTitle } from '../../i18n/workflowLabels';

const AddWorkScreen = ({ navigation }) => {
  const { t } = useTranslation('workflow');

  const { currentWork, refreshCurrentWork } = useWorkStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshCurrentWork();
    });
    return unsubscribe;
  }, [navigation, refreshCurrentWork]);

  const workflowStep = currentWork?.workflow_step ?? 1;
  const effectiveWorkflowStep =
    workflowStep >= WORKFLOW_ALL_COMPLETE_STEP
      ? WORKFLOW_ALL_COMPLETE_STEP
      : workflowStep;

  const hubTitle = useMemo(() => {
    const name = String(currentWork?.work_name ?? '').trim();
    return name || t('hub.untitledTitle');
  }, [currentWork?.work_name, t]);

  const handleStepPress = (step, status) => {
    if (status === 'locked') return;
    navigation.navigate(step.route);
  };

  const handleExitToWorks = () => {
    const worksNavigation = navigation.getParent();
    if (worksNavigation?.canGoBack()) {
      worksNavigation.goBack();
      return;
    }

    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <ScreenLayout
        showBack
        showNotification
        scrollable
        onBackPress={handleExitToWorks}
        contentStyle={styles.scrollContent}
        title={hubTitle}
        headerTitleStyle={styles.heroTitle}
      >
        <View style={styles.cardList}>
          {WORKFLOW_STEPS.map((step) => {
            const status = deriveStepStatus(step.id, effectiveWorkflowStep);
            const isLocked = status === 'locked';
            const isPending = status === 'pending';

            return (
              <NavigationCard
                key={step.id}
                title={getStepTitle(step.screenType, t)}
                disabled={isLocked}
                emphasis={isPending ? 'pending' : 'none'}
                onPress={() => handleStepPress(step, status)}
                leftIcon={<WorkflowStepBadge status={status} />}
              />
            );
          })}
        </View>
      </ScreenLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: 18,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: Spacing.xl ?? 24,
  },
  cardList: {
    marginTop: Spacing.md,
  },
});

export default AddWorkScreen;
