import { Directory, File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { getFinancialYearDetailedReport } from '../db/repositories/workReportExportRepository';
import i18n from '../i18n';
import { buildDetailedReportHtml } from './reportsPdfHtmlBuilder';

const savePdfCopy = (sourceUri, financialYear) => {
  const reportsDir = new Directory(Paths.document, 'app_reports');
  if (!reportsDir.exists) {
    reportsDir.create({ intermediates: true });
  }

  const safeFy = String(financialYear).replace(/[^a-zA-Z0-9-]/g, '_');
  const fileName = `Work_Report_FY_${safeFy}_${Date.now()}.pdf`;
  const destination = new File(reportsDir, fileName);
  const source = new File(sourceUri);

  if (destination.exists) {
    destination.delete();
  }

  // `copy` resolves asynchronously — sharing a URI before the copy lands makes
  // iOS reject the file as unreadable. `copySync` guarantees the PDF is on disk
  // by the time the URI is handed to the share sheet.
  source.copySync(destination);
  return destination.uri;
};

/**
 * Generate the detailed FY work report PDF and save it locally WITHOUT sharing.
 * Labels follow the current i18n language at export time.
 * @returns {Promise<{ noData: true } | { noData: false, filePath: string }>}
 */
export const createFinancialYearReportPdf = async ({ financialYear, works }) => {
  const report = getFinancialYearDetailedReport(financialYear, works, i18n);
  if (!report.workCount) {
    return { noData: true };
  }

  const html = buildDetailedReportHtml(report, i18n);
  const { uri } = await Print.printToFileAsync({ html });

  return { noData: false, filePath: savePdfCopy(uri, financialYear) };
};

/**
 * Present the iOS/Android share sheet for an already-created report PDF.
 *
 * IMPORTANT (iOS): call this only after any React Native <Modal> (e.g. the
 * export confirmation dialog) has been dismissed. iOS cannot present the system
 * share sheet on top of an already-presented RN modal.
 *
 * @param {string} filePath
 * @param {{ shareTitle?: string }} [options]
 * @returns {Promise<boolean>} whether the share sheet was presented
 */
export const shareReportPdf = async (filePath, { shareTitle } = {}) => {
  if (!filePath) return false;
  if (!(await Sharing.isAvailableAsync())) return false;

  await Sharing.shareAsync(filePath, {
    mimeType: 'application/pdf',
    dialogTitle: shareTitle ?? i18n.t('export.shareTitle', { ns: 'reports' }),
    UTI: 'com.adobe.pdf',
  });

  return true;
};
