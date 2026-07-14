import { Directory, File, Paths } from 'expo-file-system';

import {
  collectWorkFilePaths,
  deleteWork,
} from '../db/repositories/worksRepository';
import { cleanupDirectory } from './backup/backupFileUtils';

const deleteFileIfExists = (absolutePath) => {
  if (!absolutePath) return;

  try {
    const file = new File(absolutePath);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('[workDeleteService] file delete failed:', absolutePath, error);
  }
};

const deleteWorkDocumentsDirectory = (workId) => {
  const dir = new Directory(Paths.document, 'app_documents', `work_${workId}`);
  cleanupDirectory(dir);
};

/**
 * Permanently deletes a work, its SQLite child rows (CASCADE), and local files.
 * @param {number} workId
 * @returns {boolean} true when the work row existed and was deleted
 */
export const deleteWorkPermanently = (workId) => {
  const normalized = Number(workId);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error('deleteWorkPermanently: invalid work id');
  }

  const filePaths = collectWorkFilePaths(normalized);
  const deleted = deleteWork(normalized);
  if (!deleted) return false;

  filePaths.forEach(deleteFileIfExists);
  deleteWorkDocumentsDirectory(normalized);

  return true;
};
