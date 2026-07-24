// Settings — includes language picker (Phase 2 i18n)

import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import LanguagePicker from '../../components/LanguagePicker';
import ScreenLayout from '../../components/layouts/Screenlayout';
import NavigationCard from '../../components/Navigationcard';
import BackupProgressModal from '../../components/settings/BackupProgressModal';
import FinancialYearBudgetSection from '../../components/settings/FinancialYearBudgetSection';
import SettingsDrawer from '../../components/Settingsdrawer';
import { reportSectionLabelStyle } from '../../components/reports/reportTypography';
import { useAppDialog } from '../../context/AppDialogProvider';
import {
    createBackupArchive,
    getBackupExportPreview,
    shareBackupArchive,
} from '../../services/backup/backupExportService';
import { cleanupDirectory } from '../../services/backup/backupFileUtils';
import {
    importInspectedBackupArchive,
    inspectBackupArchiveFile,
    pickBackupArchiveFile,
} from '../../services/backup/backupImportService';
import useDraftStore from '../../store/useDraftStore';
import useWorkStore from '../../store/useWorkStore';
import {
    Colors,
    FontFamily,
    FontSize,
    FontWeight,
    Spacing,
} from '../../theme';
import {
    formatBackupSizeLabel,
    resolveBackupErrorMessage,
} from '../../utils/backupUiUtils';
import { performLogout } from '../../utils/logout';

const ICON_COLOR = '#555555';
const ICON_SIZE = 22;

/** iOS cannot present a second Modal (dialog / share sheet) while another is
 *  still dismissing. Wait for the progress modal animation to finish first. */
const waitForProgressModalDismiss = () =>
  new Promise((resolve) => setTimeout(resolve, 350));

const SettingsSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCards}>{children}</View>
  </View>
);

const SettingsScreen = () => {
  const { t, i18n } = useTranslation('settings');
  const navigation = useNavigation();
  const { showConfirmation, showSuccess, showError, showWarning, showInfo } = useAppDialog();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [backupProgress, setBackupProgress] = useState(null);

  const refreshWorks = useWorkStore((state) => state.refreshWorks);
  const clearCurrentWork = useWorkStore((state) => state.clearCurrentWork);
  const clearAllDrafts = useDraftStore((state) => state.clearAllDrafts);

  const backupBusy = backupProgress != null;

  const showExportSuccess = useCallback(
    (result) => {
      if (result.missingFileCount > 0) {
        showWarning({
          title: t('backup.successTitle'),
          message: t('backup.successWithWarnings', { count: result.missingFileCount }),
        });
        return;
      }

      if (!result.shared) {
        showSuccess({
          title: t('backup.successTitle'),
          message: t('backup.successSavedLocally'),
        });
        return;
      }

      showSuccess({
        title: t('backup.successTitle'),
        message: t('backup.successMessage'),
      });
    },
    [showSuccess, showWarning, t],
  );

  const runExport = useCallback(
    async (preview) => {
      setBackupProgress({ mode: 'export', phase: 'reading' });

      try {
        const archive = await createBackupArchive({
          estimatedArchiveBytes: preview.estimatedArchiveBytes,
          onProgress: (phase) => setBackupProgress({ mode: 'export', phase }),
        });

        // Dismiss the loading modal BEFORE presenting the share sheet. On iOS the
        // system share sheet cannot be presented over an already-visible RN
        // <Modal>, which otherwise leaves the UI stuck on the loading state.
        setBackupProgress(null);
        await waitForProgressModalDismiss();

        const shared = await shareBackupArchive(archive.filePath, {
          shareDialogTitle: t('backup.shareTitle'),
        });

        showExportSuccess({ ...archive, shared });
      } catch (error) {
        setBackupProgress(null);
        await waitForProgressModalDismiss();
        showError({
          title: t('backup.errorTitle'),
          message: resolveBackupErrorMessage(error, t, 'backup'),
        });
      } finally {
        setBackupProgress(null);
      }
    },
    [showExportSuccess, showError, t],
  );

  const handleExportBackup = useCallback(async () => {
    if (backupBusy) return;

    // Do NOT open BackupProgressModal before the empty/size dialogs.
    // On iOS (Fabric), presenting AppDialog while another RN Modal is opening
    // or dismissing fails with:
    //   "Attempt to present RCTFabricModalHostViewController while a
    //    presentation is in progress"
    // and leaves the Settings screen stuck. Preview on an empty DB is
    // fast enough that a loading Modal is unnecessary here.
    let preview;
    try {
      preview = await getBackupExportPreview();
    } catch (error) {
      showError({
        title: t('backup.errorTitle'),
        message: resolveBackupErrorMessage(error, t, 'backup'),
      });
      return;
    }

    if (preview.totalRows === 0) {
      showInfo({
        title: t('backup.emptyTitle'),
        message: t('backup.emptyMessage'),
      });
      return;
    }

    const startExport = () => {
      runExport(preview);
    };

    if (preview.isLarge) {
      await showConfirmation({
        title: t('backup.sizeWarningTitle'),
        message: t('backup.sizeWarningMessage', {
          size: formatBackupSizeLabel(preview.estimatedArchiveBytes, i18n.language),
        }),
        cancelText: t('restore.cancel'),
        confirmText: t('backup.continue'),
        onConfirm: startExport,
      });
      return;
    }

    startExport();
  }, [backupBusy, i18n.language, runExport, showConfirmation, showError, showInfo, t]);

  const handleImportBackup = useCallback(async () => {
    if (backupBusy) return;

    // Present the file picker on a clean screen FIRST. iOS cannot present the
    // document picker over a visible RN <Modal>, which otherwise leaves the UI
    // stuck on "Reading backup file…".
    let pick;
    try {
      pick = await pickBackupArchiveFile();
    } catch (error) {
      showError({
        title: t('restore.errorTitle'),
        message: resolveBackupErrorMessage(error, t, 'restore'),
      });
      return;
    }

    if (pick.canceled) return;

    let inspection;
    let stagingDir;

    setBackupProgress({ mode: 'import', phase: 'validating' });
    try {
      const inspected = inspectBackupArchiveFile(pick.fileUri, {
        language: i18n.language,
        onProgress: (phase) => setBackupProgress({ mode: 'import', phase }),
      });
      inspection = inspected.inspection;
      stagingDir = inspected.stagingDir;
    } catch (error) {
      setBackupProgress(null);
      showError({
        title: t('restore.errorTitle'),
        message: resolveBackupErrorMessage(error, t, 'restore'),
      });
      return;
    }

    setBackupProgress(null);

    if (!inspection.valid) {
      cleanupDirectory(stagingDir);
      const code = inspection.errorCodes?.[0];
      const message = code
        ? t(`restore.errors.${code}`, { defaultValue: t('restore.invalidMessage') })
        : t('restore.invalidMessage');
      showError({
        title: t('restore.invalidTitle'),
        message,
      });
      return;
    }

    const exportedLabel = inspection.exportedAtLabel || inspection.exportedAt || '—';
    const sizeLabel = formatBackupSizeLabel(
      inspection.archiveSizeBytes || inspection.totalBytes,
      i18n.language,
    );

    await showConfirmation({
      title: t('restore.confirmTitle'),
      message: t('restore.confirmMessageDetailed', {
        works: inspection.workCount,
        files: inspection.fileCount,
        size: sizeLabel,
        date: exportedLabel,
      }),
      cancelText: t('restore.cancel'),
      confirmText: t('restore.confirmButton'),
      onCancel: () => cleanupDirectory(stagingDir),
      onConfirm: async () => {
        setBackupProgress({ mode: 'import', phase: 'restoring' });
        try {
          await importInspectedBackupArchive(stagingDir, {
            inspection,
            onProgress: (phase) => setBackupProgress({ mode: 'import', phase }),
          });
          clearCurrentWork();
          clearAllDrafts();
          await refreshWorks();
          showSuccess({
            title: t('restore.successTitle'),
            message: t('restore.successMessage'),
          });
        } catch (error) {
          showError({
            title: t('restore.errorTitle'),
            message: resolveBackupErrorMessage(error, t, 'restore'),
          });
        } finally {
          setBackupProgress(null);
        }
      },
    });
  }, [
    backupBusy,
    clearAllDrafts,
    clearCurrentWork,
    i18n.language,
    refreshWorks,
    showConfirmation,
    showError,
    showSuccess,
    t,
  ]);

  return (
    <>
      <ScreenLayout
        showMenu
        showNotification
        scrollable
        title={t('title')}
        headerTitleStyle={styles.heroTitle}
        contentStyle={styles.scrollContent}
        onMenuPress={() => setDrawerOpen(true)}
      >
        <SettingsSection title={t('sections.language')}>
          <Text style={styles.languageHint}>{t('language.subtitle')}</Text>
          <LanguagePicker />
        </SettingsSection>

        <View style={styles.sectionDivider} />

        <SettingsSection title={t('sections.financialYearBudget')}>
          <FinancialYearBudgetSection />
        </SettingsSection>

        <View style={styles.sectionDivider} />

        <SettingsSection title={t('sections.dataManagement')}>
          <NavigationCard
            disabled={backupBusy}
            title={t('backup.title')}
            subtitle={t('backup.subtitle')}
            onPress={handleExportBackup}
            leftIcon={
              <Ionicons name="cloud-upload-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
          <NavigationCard
            disabled={backupBusy}
            title={t('restore.title')}
            subtitle={t('restore.subtitle')}
            onPress={handleImportBackup}
            leftIcon={
              <Ionicons name="cloud-download-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
        </SettingsSection>

        <SettingsSection title={t('sections.account')}>
          <NavigationCard
            title={t('subscription.title')}
            onPress={() => navigation.navigate('SubscriptionStatus')}
            leftIcon={
              <Ionicons name="star-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
          <NavigationCard
            title={t('logout.title')}
            subtitle={t('logout.subtitle')}
            onPress={performLogout}
            leftIcon={
              <Ionicons name="log-out-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
        </SettingsSection>

        <SettingsSection title={t('sections.support')}>
          <NavigationCard
            title={t('help.title')}
            subtitle={t('help.subtitle')}
            onPress={() => navigation.navigate('HelpGuide')}
            leftIcon={
              <Ionicons name="help-circle-outline" size={ICON_SIZE} color={ICON_COLOR} />
            }
          />
        </SettingsSection>
      </ScreenLayout>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBackupPress={handleExportBackup}
        onRestorePress={handleImportBackup}
      />

      <BackupProgressModal
        visible={backupBusy}
        mode={backupProgress?.mode ?? null}
        phase={backupProgress?.phase ?? null}
      />
    </>
  );
};

const styles = StyleSheet.create({
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: 18,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  scrollContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...reportSectionLabelStyle,
    marginBottom: Spacing.sm,
  },
  sectionCards: {},
  languageHint: {
    fontSize: FontSize.sm ?? 13,
    color: Colors.textSecondary ?? '#666666',
    marginBottom: Spacing.sm,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.borderDefault ?? '#E4E4E4',
    marginBottom: Spacing.lg,
  },
});

export default SettingsScreen;
