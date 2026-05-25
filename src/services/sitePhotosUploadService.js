/**
 * Site progress photo pick + local store (JPG/PNG only, max 10 per work).
 */

import { Alert } from 'react-native';
import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import { MAX_SITE_PHOTOS } from '../db/repositories/workProgressRepository';
import { getFileNameFromPath } from '../utils/fileName';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const PICKER_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const getExtension = (fileName, mimeType) => {
  const fromName = (fileName || '').split('.').pop()?.toLowerCase() ?? '';
  if (ALLOWED_EXTENSIONS.has(fromName)) return fromName === 'jpeg' ? 'jpg' : fromName;

  const mime = (mimeType || '').toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg';
  if (mime === 'image/png') return 'png';

  return '';
};

const getWorkProgressPhotosDirectory = (workId) => {
  const dir = new Directory(Paths.document, 'app_documents', `work_${workId}`, 'work_progress_photos');
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
};

const buildStoredFileName = (originalName, mimeType, index) => {
  const ext = getExtension(originalName, mimeType);
  if (!ext) return null;
  const stamp = Date.now();
  return `site_photo_${stamp}_${index}.${ext}`;
};

/**
 * Pick one JPG/PNG and copy to app storage.
 * @returns {Promise<string|null>} local file URI
 */
export const pickAndStoreSitePhoto = async (workId, currentCount = 0) => {
  if (!workId) {
    Alert.alert('Upload failed', 'Work ID not found. Save work details first.');
    return null;
  }

  if (currentCount >= MAX_SITE_PHOTOS) {
    Alert.alert('Limit reached', `You can upload up to ${MAX_SITE_PHOTOS} photos.`);
    return null;
  }

  let result;
  try {
    result = await getDocumentAsync({
      type: PICKER_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });
  } catch (e) {
    console.warn('[sitePhotosUploadService] picker error:', e);
    Alert.alert('Upload failed', 'Could not open the photo picker.');
    return null;
  }

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const ext = getExtension(asset.name, asset.mimeType);
  if (!ext) {
    Alert.alert('Unsupported file', 'Only JPG and PNG photos are allowed.');
    return null;
  }

  const storedFileName = buildStoredFileName(asset.name, asset.mimeType, currentCount + 1);
  if (!storedFileName) {
    Alert.alert('Unsupported file', 'Only JPG and PNG photos are allowed.');
    return null;
  }

  try {
    const workDir = getWorkProgressPhotosDirectory(workId);
    const source = new File(asset.uri);
    const destination = new File(workDir, storedFileName);

    if (destination.exists) {
      destination.delete();
    }

    source.copy(destination);
    return destination.uri;
  } catch (e) {
    console.warn('[sitePhotosUploadService] store error:', e);
    Alert.alert('Upload failed', 'Could not save the photo on this device.');
    return null;
  }
};

export const deleteSitePhotoFile = (filePath) => {
  if (!filePath) return;
  try {
    const file = new File(filePath);
    if (file.exists) {
      file.delete();
    }
  } catch (e) {
    console.warn('[sitePhotosUploadService] delete error:', e);
  }
};

export { getFileNameFromPath };
