import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UploadDocument from '../UploadDocument';
import { useAppDialog } from '../../context/AppDialogProvider';
import { buildUploadDocumentEntry } from '../../utils/documentUploadProps';
import {
  deleteBillPdfFile,
  pickAndStoreBillPdf,
} from '../../services/billPdfUploadService';

/**
 * Bill document upload section — shared document flow (Photo Library | Files), replace support.
 */
const BillDocumentUpload = ({ workId, filePath = '', onChange }) => {
  const { t } = useTranslation('workflow');
  const { showConfirmation, showError } = useAppDialog();
  const [uploading, setUploading] = useState(false);

  const handlePick = useCallback(async () => {
    if (!workId) {
      showError({
        title: t('alerts.uploadFailedTitle'),
        message: t('alerts.uploadFailedNoWorkId'),
      });
      return;
    }

    const uploadPdf = async () => {
      setUploading(true);
      try {
        const result = await pickAndStoreBillPdf(workId);
        if (result) {
          if (filePath && filePath !== result.filePath) {
            deleteBillPdfFile(filePath);
          }
          onChange?.(result.filePath);
        }
      } finally {
        setUploading(false);
      }
    };

    if (filePath) {
      await showConfirmation({
        title: t('alerts.replaceDocumentTitle'),
        message: t('alerts.replaceDocumentMessage'),
        cancelText: t('alerts.cancel'),
        confirmText: t('alerts.replace'),
        onConfirm: uploadPdf,
      });
      return;
    }

    await uploadPdf();
  }, [workId, filePath, onChange, showConfirmation, showError, t]);

  return (
    <UploadDocument
      sectionLabel={t('common.documents')}
      documents={[
        buildUploadDocumentEntry({
          title: t('steps.billSubmission.uploads.billTitle'),
          uploadText: t('steps.billSubmission.uploads.billUpload'),
          filePath,
          onPress: handlePick,
          loading: uploading,
        }),
      ]}
    />
  );
};

export default BillDocumentUpload;
