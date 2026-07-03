import i18n from '../i18n';
import { showWarningDialog } from './appDialog';

/** Workflow save validation — warning dialog with theme-styled navy icon. */
export const showWorkflowValidationFail = (message) => {
  showWarningDialog(i18n.t('common.saveFailedTitle', { ns: 'workflow' }), message);
};
