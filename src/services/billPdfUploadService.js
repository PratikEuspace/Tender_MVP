/**
 * Bill document upload — reuses shared document upload (Action Sheet + same file types).
 */

import { File } from 'expo-file-system';

import { DOCUMENT_TYPES } from '../constants/documentTypes';
import { pickAndStoreDocument } from './documentUploadService';

/**
 * Pick + store bill document via shared upload pipeline.
 * @returns {Promise<{ filePath: string, fileName: string } | null>}
 */
export const pickAndStoreBillPdf = async (workId) =>
  pickAndStoreDocument(workId, DOCUMENT_TYPES.BILL_DOCUMENT);

export const deleteBillPdfFile = (filePath) => {
  if (!filePath) return;
  try {
    const file = new File(filePath);
    if (file.exists) {
      file.delete();
    }
  } catch (e) {
    console.warn('[billPdfUploadService] delete error:', e);
  }
};
