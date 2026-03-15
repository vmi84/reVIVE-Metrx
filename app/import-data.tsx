import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { usePhysiologyStore } from '../store/physiology-store';
import { Card } from '../components/ui/Card';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { COLORS } from '../lib/utils/constants';
import { CanonicalPhysiologyRecord } from '../lib/types/canonical';

interface ImportResult {
  imported: number;
  skipped: number;
  workouts: number;
  dateRange: { start: string; end: string } | null;
}

export default function ImportData() {
  const { user } = useAuthStore();
  const { upsertRecords, lastImport, hasData } = usePhysiologyStore();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleImport() {
    try {
      const doc = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'application/vnd.ms-excel',
          'application/zip',
          'application/x-zip-compressed',
          'application/octet-stream',
        ],
      });

      if (doc.canceled) return;

      const file = doc.assets[0];
      if (!file?.uri) return;

      setImporting(true);
      setResult(null);

      const isZip =
        file.mimeType?.includes('zip') ||
        file.name?.toLowerCase().endsWith('.zip');

      let records: CanonicalPhysiologyRecord[] = [];
      let workoutCount = 0;
      let dateRange: { start: string; end: string } | null = null;

      if (isZip) {
        // Read as ArrayBuffer for ZIP parsing
        const response = await fetch(file.uri);
        const arrayBuffer = await response.arrayBuffer();

        const { parseWhoopZip } = await import(
          '../lib/adapters/whoop/zip-parser'
        );
        const zipResult = await parseWhoopZip(arrayBuffer);
        records = zipResult.records;
        workoutCount = zipResult.workoutCount;
        dateRange = zipResult.dateRange;
      } else {
        // CSV import (existing behavior)
        const response = await fetch(file.uri);
        const csvContent = await response.text();

        const { parseWhoopCSV } = await import(
          '../lib/adapters/whoop/csv-parser'
        );
        records = await parseWhoopCSV(csvContent);
        if (records.length > 0) {
          const sorted = [...records].sort((a, b) =>
            a.date.localeCompare(b.date),
          );
          dateRange = {
            start: sorted[0].date,
            end: sorted[sorted.length - 1].date,
          };
        }
      }

      let imported = 0;
      let skipped = 0;

      if (isSupabaseConfigured && user?.id) {
        // Online mode: upsert to Supabase
        for (const record of records) {
          const { error } = await supabase
            .from('daily_physiology')
            .upsert(
              {
                user_id: user.id,
                date: record.date,
                hrv_rmssd: record.cardiovascular.hrvRmssd,
                resting_heart_rate: record.cardiovascular.restingHeartRate,
                respiratory_rate: record.cardiovascular.respiratoryRate,
                spo2_pct: record.cardiovascular.spo2Pct,
                sleep_duration_ms: record.sleep.totalSleepMs,
                sleep_performance_pct: record.sleep.sleepPerformancePct,
                rem_sleep_ms: record.sleep.remSleepMs,
                deep_sleep_ms: record.sleep.deepSleepMs,
                light_sleep_ms: record.sleep.lightSleepMs,
                recovery_score: record.recovery.recoveryScore,
                sources: [isZip ? 'whoop_zip' : 'whoop_csv'],
              },
              { onConflict: 'user_id,date' },
            );

          if (error) skipped++;
          else imported++;
        }

        await supabase.from('device_imports').insert({
          user_id: user.id,
          device_type: 'whoop',
          file_name: file.name,
          rows_imported: imported,
          rows_skipped: skipped,
          status: 'completed',
        });
      } else {
        // Demo mode: store in local Zustand store
        upsertRecords(records);
        imported = records.length;

        // Save import metadata
        usePhysiologyStore.setState({
          lastImport: {
            source: isZip ? 'whoop_zip' : 'whoop_csv',
            recordCount: imported,
            dateRange,
            importedAt: new Date().toISOString(),
          },
        });
      }

      // Count total workouts across all records
      const totalWorkouts =
        workoutCount ||
        records.reduce((sum, r) => sum + r.workouts.length, 0);

      setResult({
        imported,
        skipped,
        workouts: totalWorkouts,
        dateRange,
      });
    } catch (err) {
      console.error('Import error:', err);
      Alert.alert(
        'Import Error',
        err instanceof Error ? err.message : 'Failed to import file.',
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <ThemedText variant="subtitle" style={styles.title}>
          Import Whoop Data
        </ThemedText>
        <ThemedText
          variant="body"
          color={COLORS.textSecondary}
          style={styles.description}
        >
          Export your data from the Whoop app and import the ZIP or CSV file
          here. This populates your historical physiology data for baseline
          calculations and IACI scoring.
        </ThemedText>
        <Button
          title="Select ZIP or CSV File"
          onPress={handleImport}
          loading={importing}
        />
      </Card>

      {result && (
        <Card style={styles.resultCard}>
          <ThemedText variant="subtitle" color={COLORS.success}>
            Import Complete
          </ThemedText>
          <View style={styles.resultDetails}>
            <ResultRow label="Days imported" value={result.imported} />
            {result.skipped > 0 && (
              <ResultRow label="Skipped" value={result.skipped} />
            )}
            {result.workouts > 0 && (
              <ResultRow label="Workouts" value={result.workouts} />
            )}
            {result.dateRange && (
              <ResultRow
                label="Date range"
                value={`${result.dateRange.start} to ${result.dateRange.end}`}
              />
            )}
          </View>
        </Card>
      )}

      {hasData && !result && lastImport && (
        <Card style={styles.existingCard}>
          <ThemedText variant="caption" style={styles.existingLabel}>
            PREVIOUSLY IMPORTED
          </ThemedText>
          <ThemedText variant="body">
            {lastImport.recordCount} days from {lastImport.source.replace('_', ' ')}
          </ThemedText>
          {lastImport.dateRange && (
            <ThemedText variant="caption" color={COLORS.textSecondary}>
              {lastImport.dateRange.start} to {lastImport.dateRange.end}
            </ThemedText>
          )}
        </Card>
      )}

      <Card style={styles.helpCard}>
        <ThemedText variant="caption" style={styles.helpTitle}>
          HOW TO EXPORT FROM WHOOP
        </ThemedText>
        <ThemedText
          variant="body"
          color={COLORS.textSecondary}
          style={styles.helpText}
        >
          1. Open the Whoop app on your phone{'\n'}
          2. Go to Profile {'\u2192'} Settings{'\n'}
          3. Scroll down and tap "Data Export"{'\n'}
          4. Request your data and download the ZIP{'\n'}
          5. Import the ZIP file here
        </ThemedText>
      </Card>
    </ScrollView>
  );
}

function ResultRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.resultRow}>
      <ThemedText variant="caption" color={COLORS.textSecondary}>
        {label}
      </ThemedText>
      <ThemedText variant="body" style={styles.resultValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  resultCard: {
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  resultDetails: {
    marginTop: 12,
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultValue: {
    fontWeight: '600',
  },
  existingCard: {
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  existingLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  helpCard: {
    marginTop: 16,
  },
  helpTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  helpText: {
    lineHeight: 22,
  },
});
