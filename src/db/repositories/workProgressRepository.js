// src/db/repositories/workProgressRepository.js

import { getDB } from '../database';

export const MAX_SITE_PHOTOS = 10;
export const MAX_SITE_NOTES_LENGTH = 300;

export const parseSitePhotosJson = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((uri) => typeof uri === 'string' && uri) : [];
  } catch {
    return [];
  }
};

export const serializeSitePhotos = (photos) => JSON.stringify(Array.isArray(photos) ? photos : []);

export const mapWorkProgressRowToForm = (row) => {
  if (!row) return null;

  return {
    site_notes: row.site_notes ?? '',
    site_photos: parseSitePhotosJson(row.site_photos),
  };
};

export const upsertWorkProgress = (workId, data) => {
  if (!workId) throw new Error('upsertWorkProgress: workId is required');

  const db = getDB();

  const existing = db.getFirstSync(
    'SELECT id FROM work_progress WHERE work_id = ? LIMIT 1;',
    [workId],
  );

  const siteNotes = String(data.site_notes ?? '').slice(0, MAX_SITE_NOTES_LENGTH);
  const photos = Array.isArray(data.site_photos) ? data.site_photos.slice(0, MAX_SITE_PHOTOS) : [];
  const sitePhotosJson = serializeSitePhotos(photos);

  if (existing) {
    db.runSync(
      `UPDATE work_progress SET
         site_notes  = ?,
         site_photos = ?,
         updated_at  = datetime('now')
       WHERE work_id = ?;`,
      [siteNotes, sitePhotosJson, workId],
    );
  } else {
    db.runSync(
      `INSERT INTO work_progress (work_id, site_notes, site_photos)
       VALUES (?, ?, ?);`,
      [workId, siteNotes, sitePhotosJson],
    );
  }

  return workId;
};

export const getWorkProgressByWorkId = (workId) => {
  if (!workId) return null;

  const db = getDB();

  return (
    db.getFirstSync(
      `SELECT id, work_id, site_notes, site_photos
       FROM work_progress
       WHERE work_id = ?
       LIMIT 1;`,
      [workId],
    ) ?? null
  );
};
