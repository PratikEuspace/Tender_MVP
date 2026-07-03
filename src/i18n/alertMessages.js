/**
 * Translated dialog helpers for non-React modules (upload services, etc.).
 */

import i18n from './index';
import { showAppDialog, showErrorDialog } from '../utils/appDialog';

export const tError = (key, params) => i18n.t(key, { ns: 'errors', ...params });

export const showUploadAlert = (titleKey, messageKey, params) => {
  showErrorDialog(tError(titleKey), tError(messageKey, params));
};

export const showUploadAlertWithActions = (titleKey, messageKey, buttons, params) => {
  const cancelBtn = buttons.find((btn) => btn.style === 'cancel');
  const confirmBtn = buttons.find((btn) => btn.style !== 'cancel') ?? buttons[buttons.length - 1];

  showAppDialog({
    type: 'confirmation',
    title: tError(titleKey),
    message: tError(messageKey, params),
    cancelText: cancelBtn?.textKey ? tError(cancelBtn.textKey) : cancelBtn?.text,
    confirmText: confirmBtn?.textKey ? tError(confirmBtn.textKey) : confirmBtn?.text,
    onConfirm: confirmBtn?.onPress,
    onCancel: cancelBtn?.onPress,
  });
};
