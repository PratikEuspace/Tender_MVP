// src/db/repositories/billSubmissionRepository.js

import { getDB } from '../database';
import { formatDateForStorage } from '../../utils/dateFormat';

const toBoolInt = (value) => (value ? 1 : 0);

export const mapBillSubmissionRowToForm = (row) => {
  if (!row) return null;

  return {
    bill_submitted: Boolean(row.bill_submitted),
    bill_number: row.bill_number ?? '',
    bill_date: formatDateForStorage(row.bill_date),
    bill_document: row.bill_document ?? '',
  };
};

export const upsertBillSubmission = (workId, data) => {
  if (!workId) throw new Error('upsertBillSubmission: workId is required');

  const db = getDB();

  const existing = db.getFirstSync(
    'SELECT id FROM bill_submissions WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const {
    bill_submitted = false,
    bill_number = '',
    bill_date = '',
    bill_document = null,
  } = data;

  const submitted = toBoolInt(bill_submitted);
  const billDateStored = formatDateForStorage(bill_date);
  const numberStored = submitted ? String(bill_number ?? '').trim() : '';
  const dateStored = submitted ? billDateStored : '';

  if (existing) {
    db.runSync(
      `UPDATE bill_submissions SET
         bill_submitted = ?,
         bill_number    = ?,
         bill_date      = ?,
         bill_document  = ?,
         updated_at     = datetime('now')
       WHERE work_id = ?;`,
      [submitted, numberStored, dateStored, bill_document, workId],
    );
  } else {
    db.runSync(
      `INSERT INTO bill_submissions
         (work_id, bill_submitted, bill_number, bill_date, bill_document)
       VALUES (?, ?, ?, ?, ?);`,
      [workId, submitted, numberStored, dateStored, bill_document],
    );
  }

  return workId;
};

export const getBillSubmissionByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  return (
    db.getFirstSync(
      `SELECT
         id, work_id,
         bill_submitted,
         bill_number,
         bill_date,
         bill_document
       FROM bill_submissions
       WHERE work_id = ?
       LIMIT 1;`,
      [workId],
    ) ?? null
  );
};

export const patchBillDocumentPath = (workId, filePath) => {
  if (!workId) throw new Error('patchBillDocumentPath: workId is required');

  const db = getDB();
  const existing = getBillSubmissionByWorkId(workId);

  if (existing) {
    db.runSync(
      `UPDATE bill_submissions SET bill_document = ?, updated_at = datetime('now') WHERE work_id = ?;`,
      [filePath, workId],
    );
  } else {
    db.runSync(
      `INSERT INTO bill_submissions (work_id, bill_submitted, bill_document)
       VALUES (?, 0, ?);`,
      [workId, filePath],
    );
  }
};
