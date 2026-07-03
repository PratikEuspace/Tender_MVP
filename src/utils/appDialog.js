/** Imperative dialog API for non-React modules (services, hooks, logout). */
let showDialogImpl = null;

export const registerGlobalAppDialog = (handler) => {
  showDialogImpl = handler;
};

/**
 * @param {object} options
 * @returns {Promise<boolean>}
 */
export const showAppDialog = (options) => {
  if (!showDialogImpl) {
    console.warn('[appDialog] AppDialogProvider is not mounted.');
    return Promise.resolve(false);
  }
  return showDialogImpl(options);
};

export const showConfirmationDialog = (options) =>
  showAppDialog({ ...options, type: 'confirmation' });

export const showSuccessDialog = (title, message, options = {}) =>
  showAppDialog({ ...options, type: 'success', title, message });

export const showErrorDialog = (title, message, options = {}) =>
  showAppDialog({ ...options, type: 'error', title, message });

export const showWarningDialog = (title, message, options = {}) =>
  showAppDialog({ ...options, type: 'warning', title, message });

export const showInfoDialog = (title, message, options = {}) =>
  showAppDialog({ ...options, type: 'info', title, message });
