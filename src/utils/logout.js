import i18n from '../i18n';
import { resetToActivation } from '../navigation/navigationRef';
import useAuthStore from '../store/useAuthStore';
import { showConfirmationDialog } from './confirmationDialog';

const tSettings = (key) => i18n.t(key, { ns: 'settings' });

/** Shared logout flow — clears auth session and resets navigation to Activation. */
export const performLogout = () => {
  showConfirmationDialog({
    title: tSettings('logout.confirmTitle'),
    message: tSettings('logout.confirmMessage'),
    cancelText: tSettings('logout.cancel'),
    confirmText: tSettings('logout.confirmButton'),
    onConfirm: () => {
      useAuthStore.getState().clearSession();
      // Defer nav reset so AppDialog Modal can dismiss first (iOS UIKit).
      setTimeout(() => {
        resetToActivation();
      }, 300);
    },
  });
};
