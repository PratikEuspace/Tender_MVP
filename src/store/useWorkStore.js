// src/store/useWorkStore.js
//
// Holds the works list and the currently open work.
// Source of truth: SQLite. Zustand is a read cache + write buffer.
//
// currentWorkId is persisted to AsyncStorage so it survives hot reloads
// and app restarts mid-workflow.
// works[] and currentWork are intentionally NOT persisted — always
// rehydrated fresh from SQLite.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllWorksForList,
  getWorkById,
  migrateLegacyWorkflowSteps,
} from '../db/repositories/worksRepository';

const WORKFLOW_V12_MIGRATION_KEY = 'workflow_v12_migrated';

const ensureWorkflowV12Migrated = async () => {
  const migrated = await AsyncStorage.getItem(WORKFLOW_V12_MIGRATION_KEY);
  if (migrated) return;
  migrateLegacyWorkflowSteps();
  await AsyncStorage.setItem(WORKFLOW_V12_MIGRATION_KEY, '1');
};

const useWorkStore = create(
  persist(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────────────
      works:         [],
      currentWorkId: null,
      currentWork:   null,

      // ─── Load all works from SQLite into store ─────────────────────────────
      refreshWorks: async () => {
        try {
          await ensureWorkflowV12Migrated();
          const works = getAllWorksForList();
          set({ works });
        } catch (error) {
          console.error('[useWorkStore] refreshWorks failed:', error);
        }
      },

      // ─── Set which work is being edited / viewed ───────────────────────────
      setCurrentWorkId: async (id) => {
        const normalized =
          id == null || id === ''
            ? null
            : Number(id);
        const workId =
          normalized != null && Number.isFinite(normalized) && normalized > 0
            ? normalized
            : null;

        set({ currentWorkId: workId });
        if (workId) {
          try {
            await ensureWorkflowV12Migrated();
            const work = getWorkById(workId);
            set({ currentWork: work ?? null });
          } catch (error) {
            console.error('[useWorkStore] setCurrentWorkId failed:', error);
          }
        } else {
          set({ currentWork: null });
        }
      },

      // ─── Refresh currentWork from SQLite (after a step save) ──────────────
      refreshCurrentWork: async () => {
        const { currentWorkId } = get();
        if (!currentWorkId) return;
        try {
          await ensureWorkflowV12Migrated();
          const work = getWorkById(currentWorkId);
          set({ currentWork: work ?? null });
        } catch (error) {
          console.error('[useWorkStore] refreshCurrentWork failed:', error);
        }
      },

      // ─── Clear on logout / new work flow ──────────────────────────────────
      clearCurrentWork: () => {
        set({ currentWorkId: null, currentWork: null });
      },
    }),
    {
      name:    'work-store',                              // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentWorkId: state.currentWorkId,               // ONLY this survives reloads
        // works[] and currentWork deliberately excluded — always loaded from SQLite
      }),
    },
  ),
);

export default useWorkStore;