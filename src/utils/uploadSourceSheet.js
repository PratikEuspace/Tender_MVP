/**
 * Upload source chooser — Photo Library vs Files / Documents.
 * Used by documentUploadService before opening a picker.
 */

import { ActionSheetIOS, Alert, Platform } from 'react-native';

import i18n from '../i18n';

export const UPLOAD_SOURCE = {
  PHOTO_LIBRARY: 'photo_library',
  FILES: 'files',
};

const t = (key) => i18n.t(key, { ns: 'errors' });

/**
 * @returns {Promise<'photo_library'|'files'|null>} null if cancelled
 */
export const chooseUploadSource = () =>
  new Promise((resolve) => {
    const title = t('uploadSource.title');
    const photo = t('uploadSource.photoLibrary');
    const files = t('uploadSource.files');
    const cancel = t('uploadSource.cancel');

    if (Platform.OS === 'ios') {
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
      return;
    }

    Alert.alert(title, undefined, [
      { text: cancel, style: 'cancel', onPress: () => resolve(null) },
      { text: photo, onPress: () => resolve(UPLOAD_SOURCE.PHOTO_LIBRARY) },
      { text: files, onPress: () => resolve(UPLOAD_SOURCE.FILES) },
    ]);
  });
