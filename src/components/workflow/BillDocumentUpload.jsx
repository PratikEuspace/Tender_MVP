import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import UploadDocument from '../UploadDocument';
import { buildUploadDocumentEntry } from '../../utils/documentUploadProps';
import {
  deleteBillPdfFile,
  pickAndStoreBillPdf,
} from '../../services/billPdfUploadService';

/**
 * Bill PDF upload section — PDF only, replace support.
 */
const BillDocumentUpload = ({ workId, filePath = '', onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handlePick = useCallback(async () => {
    if (!workId) {
      Alert.alert('Upload failed', 'Work ID not found. Save work details first.');
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
      Alert.alert('Replace document', 'Upload a new PDF to replace the current bill document?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', onPress: uploadPdf },
      ]);
      return;
    }

    await uploadPdf();
  }, [workId, filePath, onChange]);

  return (
    <UploadDocument
      sectionLabel="Documents"
      documents={[
        buildUploadDocumentEntry({
          title: 'Bill PDF',
          uploadText: 'Upload Bill PDF',
          filePath,
          onPress: handlePick,
          loading: uploading,
        }),
      ]}
    />
  );
};

export default BillDocumentUpload;
