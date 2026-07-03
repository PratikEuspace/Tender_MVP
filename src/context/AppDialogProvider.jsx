import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import AppDialog from '../components/AppDialog';
import { registerGlobalAppDialog } from '../utils/appDialog';

const AppDialogContext = createContext(null);

const EMPTY_STATE = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  icon: null,
  loading: false,
  dismissOnBackdropPress: false,
};

export const AppDialogProvider = ({ children }) => {
  const { t } = useTranslation('common');
  const [state, setState] = useState(EMPTY_STATE);
  const optionsRef = useRef(null);
  const resolveRef = useRef(null);
  const busyRef = useRef(false);
  const dialogGenerationRef = useRef(0);

  const closeDialog = useCallback(() => {
    busyRef.current = false;
    optionsRef.current = null;
    resolveRef.current = null;
    setState(EMPTY_STATE);
  }, []);

  const handleDismiss = useCallback(
    (confirmed) => {
      const options = optionsRef.current;
      if (!confirmed) {
        options?.onCancel?.();
      }
      resolveRef.current?.(confirmed);
      closeDialog();
    },
    [closeDialog],
  );

  const handleCancel = useCallback(() => {
    if (busyRef.current) return;
    handleDismiss(false);
  }, [handleDismiss]);

  const handleConfirm = useCallback(async () => {
    const options = optionsRef.current;
    const isConfirmation = (options?.type ?? 'info') === 'confirmation';

    if (!isConfirmation) {
      try {
        await options?.onConfirm?.();
      } catch (error) {
        console.error('[AppDialog] onConfirm failed:', error);
      }
      handleDismiss(true);
      return;
    }

    if (busyRef.current) return;

    busyRef.current = true;
    setState((current) => ({ ...current, loading: true }));

    try {
      const generationAtStart = dialogGenerationRef.current;
      await options?.onConfirm?.();
      if (dialogGenerationRef.current === generationAtStart) {
        handleDismiss(true);
      } else {
        busyRef.current = false;
      }
    } catch (error) {
      resolveRef.current?.(false);
      busyRef.current = false;
      setState((current) => ({ ...current, loading: false }));
      throw error;
    }
  }, [handleDismiss]);

  const showDialog = useCallback(
    (options = {}) => {
      const type = options.type ?? 'info';
      const isConfirmation = type === 'confirmation';

      if (resolveRef.current) {
        resolveRef.current(false);
      }
      busyRef.current = false;
      dialogGenerationRef.current += 1;

      return new Promise((resolve) => {
        resolveRef.current = resolve;
        optionsRef.current = options;

        setState({
          visible: true,
          type,
          title: options.title ?? '',
          message: options.message ?? '',
          confirmText:
            options.confirmText ?? (isConfirmation ? t('dialog.yes') : t('dialog.ok')),
          cancelText: options.cancelText ?? t('dialog.no'),
          icon: options.icon ?? null,
          loading: false,
          dismissOnBackdropPress: options.dismissOnBackdropPress ?? false,
        });
      });
    },
    [t],
  );

  const showConfirmation = useCallback(
    (options) => showDialog({ ...options, type: 'confirmation' }),
    [showDialog],
  );

  const showSuccess = useCallback(
    (options) => showDialog({ ...options, type: 'success' }),
    [showDialog],
  );

  const showError = useCallback(
    (options) => showDialog({ ...options, type: 'error' }),
    [showDialog],
  );

  const showWarning = useCallback(
    (options) => showDialog({ ...options, type: 'warning' }),
    [showDialog],
  );

  const showInfo = useCallback(
    (options) => showDialog({ ...options, type: 'info' }),
    [showDialog],
  );

  useEffect(() => {
    registerGlobalAppDialog(showDialog);
    return () => registerGlobalAppDialog(null);
  }, [showDialog]);

  const contextValue = useMemo(
    () => ({
      showDialog,
      showConfirmation,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    }),
    [showDialog, showConfirmation, showSuccess, showError, showWarning, showInfo],
  );

  return (
    <AppDialogContext.Provider value={contextValue}>
      {children}
      <AppDialog
        visible={state.visible}
        type={state.type}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        icon={state.icon}
        loading={state.loading}
        dismissOnBackdropPress={state.dismissOnBackdropPress}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AppDialogContext.Provider>
  );
};

export const useAppDialog = () => {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error('useAppDialog must be used within AppDialogProvider');
  }
  return context;
};

/** @deprecated Use useAppDialog */
export const useConfirmationDialog = () => {
  const { showConfirmation } = useAppDialog();
  return { showConfirmation };
};

/** @deprecated Use AppDialogProvider */
export const ConfirmationDialogProvider = AppDialogProvider;
