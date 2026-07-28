/**
 * Upload source chooser — Photo Library vs Files / Documents.
 * Used by documentUploadService before opening a picker.
 *
 * iOS: native ActionSheetIOS (unchanged).
 * Android: custom bottom sheet via UploadSourceSheetProvider.
 */

import { ActionSheetIOS, Platform } from 'react-native';

import i18n from '../i18n';

export const UPLOAD_SOURCE = {
  PHOTO_LIBRARY: 'photo_library',
  FILES: 'files',
};

const t = (key) => i18n.t(key, { ns: 'errors' });

/** @type {null | (() => Promise<'photo_library'|'files'|null>)} */
let showUploadSourceSheetImpl = null;

export const registerUploadSourceSheet = (handler) => {
  showUploadSourceSheetImpl = handler;
};

/**
 * @returns {Promise<'photo_library'|'files'|null>} null if cancelled
 */
export const chooseUploadSource = () => {
  if (Platform.OS === 'ios') {
    return new Promise((resolve) => {
      const title = t('uploadSource.title');
      const photo = t('uploadSource.photoLibrary');
      const files = t('uploadSource.files');
      const cancel = t('uploadSource.cancel');

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: [cancel, photo, files],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) resolve(UPLOAD_SOURCE.PHOTO_LIBRARY);
          else if (buttonIndex === 2) resolve(UPLOAD_SOURCE.FILES);
          else resolve(null);
        },
      );
    });
  }

  if (!showUploadSourceSheetImpl) {
    console.warn('[uploadSourceSheet] UploadSourceSheetProvider is not mounted.');
    return Promise.resolve(null);
  }

  return showUploadSourceSheetImpl();
};
