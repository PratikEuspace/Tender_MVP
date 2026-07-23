// src/screens/Works/WorksScreen.jsx
// Works list — load from SQLite, tap to resume on Add Work hub, swipe left to delete.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import AppToast from '../../components/AppToast';
import ScreenLayout from '../../components/layouts/Screenlayout';
import SettingsDrawer from '../../components/Settingsdrawer';
import StatusChip, { workCompletedToChipStatus } from '../../components/Statuschip';
import StatusChipGroup from '../../components/Statuschipgroup';
import { WORKFLOW_ROUTES } from '../../constants/WorkflowSteps';
import { useAppDialog } from '../../context/AppDialogProvider';
import { deleteWorkPermanently } from '../../services/workDeleteService';
import useDraftStore from '../../store/useDraftStore';
import useUIStore from '../../store/useUIStore';
import useWorkStore from '../../store/useWorkStore';
import theme from '../../theme';

const CARD_MARGIN_H = 16;
const PANEL_WIDTH = 97;
const CARD_RADIUS = theme.Radius?.md ?? 8;
const THRESHOLD = PANEL_WIDTH * 0.5;
const PRIMARY = theme.Colors?.primary ?? '#062E52';
const PRESS_LOCK_RELEASE_MS = 60;

const formatBudget = (budget) => {
  const n = Number(budget) || 0;
  if (n === 0) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/** Bandhan Setu–style swipe-left row (delete panel only). */
function SwipeableDeleteRow({
  workId,
  onOpen,
  onDelete,
  disabled,
  deleteLabel,
  accessibilityLabel,
  registerClose,
  children,
}) {
  const translateX = useSharedValue(0);
  const savedX = useSharedValue(0);
  const [pressLocked, setPressLocked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const releaseTimerRef = useRef(null);

  const clearReleaseTimer = useCallback(() => {
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }, []);

  const lockPress = useCallback(() => {
    clearReleaseTimer();
    setPressLocked(true);
  }, [clearReleaseTimer]);

  const unlockPressSoon = useCallback(() => {
    clearReleaseTimer();
    releaseTimerRef.current = setTimeout(() => {
      setPressLocked(false);
      releaseTimerRef.current = null;
    }, PRESS_LOCK_RELEASE_MS);
  }, [clearReleaseTimer]);

  const close = useCallback(() => {
    translateX.value = withSpring(0);
    setIsOpen(false);
  }, [translateX]);

  useEffect(() => {
    registerClose?.(workId, close);
    return () => {
      registerClose?.(workId, null);
      clearReleaseTimer();
    };
  }, [clearReleaseTimer, close, registerClose, workId]);

  const notifyOpen = useCallback(() => {
    onOpen?.(workId);
  }, [onOpen, workId]);

  const handleSnapOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleSnapClosed = useCallback(() => {
    setIsOpen(false);
  }, []);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-10, 10])
        .enabled(!disabled)
        .onStart(() => {
          // Lock only after horizontal pan activates — do not block plain taps.
          savedX.value = translateX.value;
          runOnJS(lockPress)();
          runOnJS(notifyOpen)();
        })
        .onUpdate((event) => {
          const next = savedX.value + event.translationX;
          // Swipe left only — reveal delete panel on the right.
          translateX.value = Math.max(-PANEL_WIDTH, Math.min(0, next));
        })
        .onEnd(() => {
          if (translateX.value < -THRESHOLD) {
            translateX.value = withSpring(-PANEL_WIDTH);
            runOnJS(handleSnapOpen)();
          } else {
            translateX.value = withSpring(0);
            runOnJS(handleSnapClosed)();
          }
        })
        .onFinalize(() => {
          runOnJS(unlockPressSoon)();
        }),
    [
      disabled,
      handleSnapClosed,
      handleSnapOpen,
      lockPress,
      notifyOpen,
      savedX,
      translateX,
      unlockPressSoon,
    ],
  );

  // Let the card TouchableOpacity receive taps; pan still wins after activeOffsetX.
  const composedGesture = useMemo(
    () => Gesture.Simultaneous(pan, Gesture.Native()),
    [pan],
  );

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Panel stays fully opaque behind the card — covered until the card slides.
  // Avoids margin-gutter blue flash from opacity fade-in.
  const rightPanelAnimStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -0.5 ? 1 : 0,
  }));

  return (
    <View style={swipeStyles.row}>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[swipeStyles.panel, swipeStyles.panelRight, rightPanelAnimStyle]}
      >
        <TouchableOpacity
          style={swipeStyles.panelTouchable}
          onPress={() => {
            onDelete?.();
            close();
          }}
          activeOpacity={0.85}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          <Ionicons name="trash-outline" size={28} color="#FFFFFF" />
          <Text style={swipeStyles.panelLabel}>{deleteLabel}</Text>
        </TouchableOpacity>
      </Animated.View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View style={cardAnimStyle}>
          {typeof children === 'function'
            ? children({ pressLocked, isOpen, close })
            : children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const WorkListCard = ({ work, onPress, pressLocked = false, isOpen = false, onRequestClose, t }) => {
  const chipStatus = workCompletedToChipStatus(work.work_completed);
  const meta = [work.ward, work.department].filter(Boolean).join(' | ');

  const handlePress = () => {
    if (pressLocked) return;
    if (isOpen) {
      onRequestClose?.();
      return;
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={t('works:openWorkAccessibility', {
        name: work.work_name || t('common:untitledWork'),
      })}
    >
      <View style={styles.cardRow} pointerEvents="none">
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {work.work_name || t('common:untitledWork')}
          </Text>
          {work.work_code ? (
            <Text style={styles.cardCode} numberOfLines={1}>
              {t('common:codePrefix', { code: work.work_code })}
            </Text>
          ) : null}
          {meta ? (
            <Text style={styles.cardMeta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
          <Text style={styles.cardBudget}>{formatBudget(work.budget)}</Text>
        </View>

        <View style={styles.cardChipColumn}>
          <StatusChip status={chipStatus} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const WorksScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation(['works', 'common']);
  const { works, currentWorkId, refreshWorks, setCurrentWorkId, clearCurrentWork } =
    useWorkStore();
  const clearDraftsForWork = useDraftStore((state) => state.clearDraftsForWork);
  const isSaving = useUIStore((state) => state.isSaving);
  const { showConfirmation, showError, showWarning } = useAppDialog();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [deletingWorkId, setDeletingWorkId] = useState(null);
  const closeFnsRef = useRef(new Map());

  useFocusEffect(
    useCallback(() => {
      refreshWorks();
    }, [refreshWorks]),
  );

  const filteredWorks = useMemo(() => {
    if (statusFilter === 'all') return works;
    return works.filter(
      (work) => workCompletedToChipStatus(work.work_completed) === statusFilter,
    );
  }, [works, statusFilter]);

  const handleOpenWork = useCallback(
    (work) => {
      setCurrentWorkId(work.id);
      navigation.navigate('Add Work', {
        screen: WORKFLOW_ROUTES.ADD_WORK,
      });
    },
    [navigation, setCurrentWorkId],
  );

  const registerClose = useCallback((workId, closeFn) => {
    if (closeFn) {
      closeFnsRef.current.set(workId, closeFn);
    } else {
      closeFnsRef.current.delete(workId);
    }
  }, []);

  const closeOtherRows = useCallback((activeWorkId) => {
    closeFnsRef.current.forEach((closeFn, workId) => {
      if (workId !== activeWorkId) {
        closeFn?.();
      }
    });
  }, []);

  const handleDeletePress = useCallback(
    async (work) => {
      closeFnsRef.current.get(work.id)?.();

      if (isSaving) {
        showWarning({
          title: t('works:deleteBusyTitle'),
          message: t('works:deleteBusyMessage'),
        });
        return;
      }

      const workName = work.work_name || t('common:untitledWork');
      const confirmed = await showConfirmation({
        title: t('works:deleteTitle'),
        message: t('works:deleteMessage', { name: workName }),
        confirmText: t('common:dialog.yes'),
        cancelText: t('common:dialog.no'),
      });

      if (!confirmed) return;

      setDeletingWorkId(work.id);
      try {
        const deleted = deleteWorkPermanently(work.id);
        if (!deleted) {
          showError({
            title: t('works:deleteErrorTitle'),
            message: t('works:deleteErrorMessage'),
          });
          return;
        }

        if (currentWorkId === work.id) {
          clearCurrentWork();
        }
        clearDraftsForWork(work.id);
        await refreshWorks();
        setToastMessage(t('works:deleteSuccess'));
      } catch (error) {
        console.error('[WorksScreen] delete failed:', error);
        showError({
          title: t('works:deleteErrorTitle'),
          message: t('works:deleteErrorMessage'),
        });
      } finally {
        setDeletingWorkId(null);
      }
    },
    [
      clearCurrentWork,
      clearDraftsForWork,
      currentWorkId,
      isSaving,
      refreshWorks,
      showConfirmation,
      showError,
      showWarning,
      t,
    ],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <SwipeableDeleteRow
        workId={item.id}
        onOpen={closeOtherRows}
        onDelete={() => handleDeletePress(item)}
        disabled={deletingWorkId === item.id}
        deleteLabel={t('works:deleteButton')}
        accessibilityLabel={t('works:deleteAccessibility', {
          name: item.work_name || t('common:untitledWork'),
        })}
        registerClose={registerClose}
      >
        {({ pressLocked, isOpen, close }) => (
          <WorkListCard
            work={item}
            onPress={() => handleOpenWork(item)}
            pressLocked={pressLocked}
            isOpen={isOpen}
            onRequestClose={close}
            t={t}
          />
        )}
      </SwipeableDeleteRow>
    ),
    [
      closeOtherRows,
      deletingWorkId,
      handleDeletePress,
      handleOpenWork,
      registerClose,
      t,
    ],
  );

  const ListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        <StatusChipGroup
          selectedStatus={statusFilter}
          onChange={setStatusFilter}
        />
      </View>
    ),
    [statusFilter, i18n.language],
  );

  return (
    <>
      <ScreenLayout
        title={t('works:title')}
        showMenu
        showNotification
        scrollable={false}
        contentStyle={styles.screenBody}
        onMenuPress={() => setDrawerOpen(true)}
      >
        <FlatList
          style={styles.list}
          data={filteredWorks}
          extraData={[i18n.language, deletingWorkId, statusFilter]}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('works:emptyTitle')}</Text>
              <Text style={styles.emptyHint}>{t('works:emptyHint')}</Text>
            </View>
          }
        />
      </ScreenLayout>

      <AppToast
        visible={Boolean(toastMessage)}
        message={toastMessage}
        position="bottom"
        icon="checkmark-circle-outline"
        onHide={() => setToastMessage('')}
      />

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const swipeStyles = StyleSheet.create({
  row: {
    overflow: 'hidden',
    marginBottom: 13,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    // Wider than the swipe distance so it always reaches the card's edge —
    // CARD_MARGIN_H absorbs the card's own margin, and CARD_RADIUS absorbs
    // the card's rounded-corner cutout (a rounded corner leaves a small
    // unfilled sliver at the curve; without this the row's plain background
    // shows through there instead of the panel).
    width: PANEL_WIDTH + CARD_MARGIN_H + CARD_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.Spacing?.xs ?? 6,
    borderWidth: 1,
    borderColor: "#F0FFFF",
  },
  panelRight: {
    right: 0,
    backgroundColor: PRIMARY,
    // No radius here on purpose: the panel is a flat rectangle sitting
    // behind the card. The card's own rounded corner + border is the only
    // curve in the composition, so it merges seamlessly with the panel
    // instead of two independent curves fighting for the same seam.
  },
  panelTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.Spacing?.xs ?? 6,
  },
  panelLabel: {
    color: "#FFFFFF",
    fontSize: theme.FontSize?.sm ?? 14,
    fontFamily: theme.FontFamily?.medium,
    fontWeight: theme.FontWeight?.medium ?? '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});

const styles = StyleSheet.create({
  screenBody: {
    paddingHorizontal: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.Spacing?.xl ?? 24,
    flexGrow: 1,
  },
  listHeader: {
    paddingHorizontal: CARD_MARGIN_H,
  },
  card: {
    backgroundColor: theme.Colors?.white ?? '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#000000',
    borderRadius: CARD_RADIUS,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: CARD_MARGIN_H,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    paddingRight: 10,
    minWidth: 0,
  },
  cardChipColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 4,
  },
  cardCode: {
    fontSize: 13,
    fontWeight: '400',
    color: '#444444',
    lineHeight: 18,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 13,
    fontWeight: '400',
    color: '#444444',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardBudget: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY,
    lineHeight: 20,
  },
  empty: {
    paddingTop: theme.Spacing?.xl ?? 32,
    alignItems: 'center',
    paddingHorizontal: CARD_MARGIN_H,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.Colors?.textPrimary ?? '#1A1A1A',
  },
  emptyHint: {
    fontSize: theme.FontSize?.sm ?? 13,
    color: theme.Colors?.textSecondary ?? '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WorksScreen;