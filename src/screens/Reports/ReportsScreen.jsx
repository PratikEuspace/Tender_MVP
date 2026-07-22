import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import FinancialYearDropdown from '../../components/dashboard/FinancialYearDropdown';
import ScreenLayout from '../../components/layouts/Screenlayout';
import ReportBudgetCard from '../../components/reports/ReportBudgetCard';
import ReportCategoryChipRow from '../../components/reports/ReportCategoryChipRow';
import ReportExportSection from '../../components/reports/ReportExportSection';
import ReportInfoBanner from '../../components/reports/ReportInfoBanner';
import ReportStatCard from '../../components/reports/ReportStatCard';
import SettingsDrawer from '../../components/Settingsdrawer';
import { workCompletedToChipStatus } from '../../components/Statuschip';
import { useAppDialog } from '../../context/AppDialogProvider';
import {
  emptyBudgetSummary,
  filterWorksByFinancialYear,
  getReportsBudgetSummary,
} from '../../db/repositories/reportsRepository';
import { translateBudgetSummary } from '../../i18n/reportLabels';
import { exportFinancialYearReportPdf } from '../../services/reportsPdfExportService';
import useWorkStore from '../../store/useWorkStore';

const ReportsScreen = () => {
  const { t, i18n } = useTranslation('reports');
  const { showConfirmation, showSuccess, showError, showInfo } = useAppDialog();
  const { works, refreshWorks } = useWorkStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fy, setFy] = useState('2025-26');
  const [rawBudgetSummary, setRawBudgetSummary] = useState(() => emptyBudgetSummary());
  const [exportingPdf, setExportingPdf] = useState(false);

  const budgetSummary = useMemo(
    () => translateBudgetSummary(rawBudgetSummary),
    [rawBudgetSummary, i18n.language],
  );

  const workStats = useMemo(() => {
    const fyWorks = filterWorksByFinancialYear(works, fy);
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    fyWorks.forEach((work) => {
      const status = workCompletedToChipStatus(work.work_completed);
      if (status === 'completed') completed += 1;
      else if (status === 'progress') inProgress += 1;
      else pending += 1;
    });

    return {
      total: fyWorks.length,
      completed,
      inProgress,
      pending,
    };
  }, [works, fy]);

  const loadBudgetSummary = useCallback(() => {
    try {
      setRawBudgetSummary(getReportsBudgetSummary(fy, { useTotalAmountPaid: true }));
    } catch (error) {
      console.error('[ReportsScreen] getReportsBudgetSummary failed:', error);
      setRawBudgetSummary(emptyBudgetSummary());
    }
  }, [fy]);

  useFocusEffect(
    useCallback(() => {
      refreshWorks();
      loadBudgetSummary();
    }, [refreshWorks, loadBudgetSummary]),
  );

  useEffect(() => {
    loadBudgetSummary();
  }, [loadBudgetSummary]);

  const handleFyChange = useCallback((nextFy) => {
    setFy(nextFy);
  }, []);

  const pdfExportLabels = useMemo(
    () => ({
      shareTitle: t('export.shareTitle'),
    }),
    [t],
  );

  const handleExportPdf = useCallback(async () => {
    if (exportingPdf) return;

    await showConfirmation({
      title: t('export.confirmTitle'),
      message: t('export.confirmMessage'),
      onConfirm: async () => {
        setExportingPdf(true);
        try {
          const result = await exportFinancialYearReportPdf({
            financialYear: fy,
            works,
            labels: pdfExportLabels,
          });

          if (result.noData) {
            showInfo({
              title: t('export.noDataTitle'),
              message: t('export.noDataMessage'),
            });
            return;
          }

          showSuccess({
            title: t('export.successTitle'),
            message: t('export.successMessage'),
          });
        } catch (error) {
          console.error('[ReportsScreen] export PDF failed:', error);
          showError({
            title: t('export.errorTitle'),
            message: t('export.errorMessage'),
          });
        } finally {
          setExportingPdf(false);
        }
      },
    });
  }, [exportingPdf, fy, works, pdfExportLabels, showConfirmation, showError, showInfo, showSuccess, t]);

  return (
    <>
      <ScreenLayout
        title={t('title')}
        showMenu
        scrollable
        onMenuPress={() => setDrawerOpen(true)}
        headerRight={<FinancialYearDropdown value={fy} onChange={handleFyChange} />}
        contentStyle={styles.scrollContent}
      >
        <ReportCategoryChipRow style={styles.chips} />

        <View style={styles.statsRow}>
          <ReportStatCard
            variant="total"
            value={String(workStats.total)}
            title={t('stats.totalWorks')}
            subtitle={t('stats.totalWorksSubtitle')}
          />
          <View style={styles.statsGap} />
          <ReportStatCard
            variant="completed"
            value={String(workStats.completed)}
            title={t('stats.completed')}
            subtitle={t('stats.completedSubtitle')}
          />
        </View>

        <View style={styles.statsRow}>
          <ReportStatCard
            variant="inProgress"
            value={String(workStats.inProgress)}
            title={t('stats.inProgress')}
            subtitle={t('stats.inProgressSubtitle')}
          />
          <View style={styles.statsGap} />
          <ReportStatCard
            variant="pending"
            value={String(workStats.pending)}
            title={t('stats.pending')}
            subtitle={t('stats.pendingSubtitle')}
          />
        </View>

        <ReportInfoBanner message={budgetSummary.bannerText} />

        <ReportBudgetCard
          barPrimaryLabel={budgetSummary.barPrimaryLabel}
          barRemainingLabel={budgetSummary.barRemainingLabel}
          totalBudgetDetail={budgetSummary.totalBudgetDetail}
          totalUsedDetail={budgetSummary.totalUsedDetail}
          progressPercent={budgetSummary.percent}
        />

        <ReportExportSection
          onExportPdf={handleExportPdf}
          exportingPdf={exportingPdf}
        />
      </ScreenLayout>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 28,
  },
  chips: {
    marginBottom: 14,
    marginHorizontal: -4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statsGap: {
    width: 12,
  },
});

export default ReportsScreen;
