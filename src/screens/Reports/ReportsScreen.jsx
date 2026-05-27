import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenLayout from '../../components/layouts/Screenlayout';
import SettingsDrawer from '../../components/Settingsdrawer';
import NotificationButton from '../../components/Notificationbutton';
import FinancialYearDropdown from '../../components/dashboard/FinancialYearDropdown';
import { workCompletedToChipStatus } from '../../components/Statuschip';
import useWorkStore from '../../store/useWorkStore';
import theme from '../../theme';
import ReportCategoryChipRow from '../../components/reports/ReportCategoryChipRow';
import ReportStatCard from '../../components/reports/ReportStatCard';
import ReportInfoBanner from '../../components/reports/ReportInfoBanner';
import ReportBudgetCard from '../../components/reports/ReportBudgetCard';
import ReportExportSection from '../../components/reports/ReportExportSection';
import ReportShareCard from '../../components/reports/ReportShareCard';
import {
  emptyBudgetSummary,
  getReportsBudgetSummary,
} from '../../db/repositories/reportsRepository';

const ReportsScreen = () => {
  const { works, refreshWorks } = useWorkStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fy, setFy] = useState('2025-26');
  const [budgetSummary, setBudgetSummary] = useState(() => emptyBudgetSummary());

  const workStats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    works.forEach((work) => {
      const status = workCompletedToChipStatus(work.work_completed);
      if (status === 'completed') completed += 1;
      else if (status === 'progress') inProgress += 1;
      else pending += 1;
    });

    return {
      total: works.length,
      completed,
      inProgress,
      pending,
    };
  }, [works]);

  const loadBudgetSummary = useCallback(() => {
    try {
      setBudgetSummary(getReportsBudgetSummary(fy));
    } catch (error) {
      console.error('[ReportsScreen] getReportsBudgetSummary failed:', error);
      setBudgetSummary(emptyBudgetSummary());
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

  return (
    <>
      <ScreenLayout
        title="Reports"
        showMenu
        showNotification={false}
        scrollable
        onMenuPress={() => setDrawerOpen(true)}
        headerRight={
          <View style={styles.headerRight}>
            <FinancialYearDropdown value={fy} onChange={handleFyChange} />
            <NotificationButton
              iconColor={theme.Colors.white ?? '#FFFFFF'}
              iconSize={20}
            />
          </View>
        }
        contentStyle={styles.scrollContent}
      >
        <ReportCategoryChipRow style={styles.chips} />

        <View style={styles.statsRow}>
          <ReportStatCard
            variant="total"
            value={String(workStats.total)}
            title="Total Works"
            subtitle="+4 from last year"
          />
          <View style={styles.statsGap} />
          <ReportStatCard
            variant="completed"
            value={String(workStats.completed)}
            title="Completed"
            subtitle="58% completed rate"
          />
        </View>

        <View style={styles.statsRow}>
          <ReportStatCard
            variant="inProgress"
            value={String(workStats.inProgress)}
            title="In Progress"
            subtitle="Target: complete by Aug"
          />
          <View style={styles.statsGap} />
          <ReportStatCard
            variant="pending"
            value={String(workStats.pending)}
            title="Pending"
            subtitle="Needs attention"
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

        <ReportExportSection />

        <ReportShareCard />
      </ScreenLayout>

      <SettingsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
