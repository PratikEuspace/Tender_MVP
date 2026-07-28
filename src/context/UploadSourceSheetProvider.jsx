import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UploadSourceSheet from '../components/UploadSourceSheet';
import {
  UPLOAD_SOURCE,
  registerUploadSourceSheet,
} from '../utils/uploadSourceSheet';

const EMPTY = {
  visible: false,
  title: '',
  photoLabel: '',
  filesLabel: '',
  cancelLabel: '',
};

/** Let RN Modal finish dismissing before Gallery/Files pickers open. */
const DISMISS_SETTLE_MS = 300;

/**
 * Hosts the Android upload-source bottom sheet and exposes it to
 * documentUploadService via registerUploadSourceSheet.
 */
export const UploadSourceSheetProvider = ({ children }) => {
  const { t } = useTranslation('errors');
  const [state, setState] = useState(EMPTY);
  const resolveRef = useRef(null);

  const closeAndResolve = useCallback((value) => {
    setState(EMPTY);
    const resolve = resolveRef.current;
    resolveRef.current = null;
    // Resolve after dismiss so Android pickers are not launched under this Modal.
    setTimeout(() => resolve?.(value), DISMISS_SETTLE_MS);
  }, []);

  const showSheet = useCallback(
    () =>
      new Promise((resolve) => {
        if (resolveRef.current) {
          resolveRef.current(null);
        }
        resolveRef.current = resolve;
        setState({
          visible: true,
          title: t('uploadSource.title'),
          photoLabel: t('uploadSource.photoLibrary'),
          filesLabel: t('uploadSource.files'),
          cancelLabel: t('uploadSource.cancel'),
        });
      }),
    [t],
  );

  useEffect(() => {
    registerUploadSourceSheet(showSheet);
    return () => registerUploadSourceSheet(null);
  }, [showSheet]);

  return (
    <>
      {children}
      <UploadSourceSheet
        visible={state.visible}
        title={state.title}
        photoLabel={state.photoLabel}
        filesLabel={state.filesLabel}
        cancelLabel={state.cancelLabel}
        onSelectPhoto={() => closeAndResolve(UPLOAD_SOURCE.PHOTO_LIBRARY)}
        onSelectFiles={() => closeAndResolve(UPLOAD_SOURCE.FILES)}
        onCancel={() => closeAndResolve(null)}
      />
    </>
  );
};

export default UploadSourceSheetProvider;
