import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { dashboardCardSurfaceStyle } from '../dashboard/dashboardCardBorder';
import { reportSectionLabelStyle } from './reportTypography';

const ReportExportSection = ({
  style,
  onExportPdf,
  exportingPdf = false,
}) => {
  const { t } = useTranslation('reports');
  const title = t('export.pdf');
  const disabled = exportingPdf || !onExportPdf;

  return (
    <View style={[styles.section, style]}>
      <Text style={styles.sectionTitle}>{t('export.sectionTitle')}</Text>

      <Pressable
        style={[styles.card, disabled && styles.cardDisabled]}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        onPress={onExportPdf}
        disabled={disabled}
      >
        <View style={styles.iconCircle}>
          {exportingPdf ? (
            <ActivityIndicator size="small" color="#062E52" />
          ) : (
            <Ionicons name="document-text-outline" size={22} color="#062E52" />
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{t('export.pdfSubtitle')}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...reportSectionLabelStyle,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...dashboardCardSurfaceStyle,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardDisabled: {
    opacity: 0.72,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF5FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default ReportExportSection;
