/**
 * Site / inauguration photo pick + local store.
 * Opens Photo Library directly (no Action Sheet, no Files picker).
 */

import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { MAX_SITE_PHOTOS } from '../db/repositories/workProgressRepository';
import { getFileNameFromPath } from '../utils/fileName';
import { showUploadAlert } from '../i18n/alertMessages';
import { launchImageLibrarySafely } from '../utils/launchImageLibrary';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif']);

const getExtension = (fileName, mimeType) => {
  const fromName = (fileName || '').split('.').pop()?.toLowerCase() ?? '';
  if (ALLOWED_EXTENSIONS.has(fromName)) return fromName === 'jpeg' ? 'jpg' : fromName;

  const mime = (mimeType || '').toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/heic' || mime.includes('heic')) return 'heic';
  if (mime === 'image/heif' || mime.includes('heif')) return 'heif';

  return '';
};

const mapGalleryAsset = (asset) => {
  const mimeType = (asset.mimeType || 'image/jpeg').toLowerCase();
  let ext = getExtension(asset.fileName, mimeType);
  if (!ext) {
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('heic')) ext = 'heic';
    else if (mimeType.includes('heif')) ext = 'heif';
    else {
      const fromUri = (asset.uri || '').split('.').pop()?.toLowerCase() ?? '';
      ext = ALLOWED_EXTENSIONS.has(fromUri)
        ? fromUri === 'jpeg'
          ? 'jpg'
          : fromUri
        : 'jpg';
    }
  }

  const name =
    asset.fileName ||
    `gallery_photo_${Date.now()}.${ext === 'jpeg' ? 'jpg' : ext}`;

  return {
    uri: asset.uri,
    name,
    mimeType: mimeType.startsWith('image/') ? mimeType : `image/${ext}`,
  };
};

const getWorkPhotosDirectory = (workId, subfolder = 'work_progress_photos') => {
  const dir = new Directory(Paths.document, 'app_documents', `work_${workId}`, subfolder);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
};

const buildStoredFileName = (originalName, mimeType, index, filePrefix = 'site_photo') => {
  const ext = getExtension(originalName, mimeType);
  if (!ext) return null;
  const stamp = Date.now();
  return `${filePrefix}_${stamp}_${index}.${ext}`;
};

/**
 * Pick one photo from the library and copy to app storage.
 * @returns {Promise<string|null>} local file URI
 */
export const pickAndStoreSitePhoto = async (workId, currentCount = 0, options = {}) => {
  const {
    subfolder = 'work_progress_photos',
    filePrefix = 'site_photo',
    maxPhotos = MAX_SITE_PHOTOS,
  } = options;

  if (!workId) {
    showUploadAlert('upload.failedTitle', 'upload.failedNoWorkId');
    return null;
  }

  if (currentCount >= maxPhotos) {
    showUploadAlert('upload.limitReachedTitle', 'upload.limitReachedPhotos', { max: maxPhotos });
    return null;
  }

  let asset;
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showUploadAlert('upload.failedTitle', 'upload.galleryPermissionDenied');
      return null;
    }

    const result = await launchImageLibrarySafely({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    asset = mapGalleryAsset(result.assets[0]);
  } catch (e) {
    console.warn('[sitePhotosUploadService] picker error:', e);
    showUploadAlert('upload.failedTitle', 'upload.failedPhotoPicker');
    return null;
  }

  const ext = getExtension(asset.name, asset.mimeType);
  if (!ext) {
    showUploadAlert('upload.unsupportedTitle', 'upload.unsupportedPhotos');
    return null;
  }

  const storedFileName = buildStoredFileName(
    asset.name,
    asset.mimeType,
    currentCount + 1,
    filePrefix,
  );
  if (!storedFileName) {
    showUploadAlert('upload.unsupportedTitle', 'upload.unsupportedPhotos');
    return null;
  }

  try {
    const workDir = getWorkPhotosDirectory(workId, subfolder);
    const source = new File(asset.uri);
    const destination = new File(workDir, storedFileName);

    if (destination.exists) {
      destination.delete();
    }

    source.copy(destination);
    return destination.uri;
  } catch (e) {
    console.warn('[sitePhotosUploadService] store error:', e);
    showUploadAlert('upload.failedTitle', 'upload.failedSavePhoto');
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
