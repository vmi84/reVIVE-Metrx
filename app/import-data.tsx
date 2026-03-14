import { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { Card } from '../components/ui/Card';
import { ThemedText } from '../components/ui/ThemedText';
import { Button } from '../components/ui/Button';
import { COLORS } from '../lib/utils/constants';

export default function ImportData() {
  const { user } = useAuthStore();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  async function handleImport() {
    try {
      const doc = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel'],
      });

      if (doc.canceled) return;

      const file = doc.assets[0];
      if (!file?.uri) return;

      setImporting(true);
      setResult(null);

      // Read file content
      const response = await fetch(file.uri);
      const csvContent = await response.text();

      // Lazy-import the CSV parser
      const { parseWhoopCSV } = await import('../lib/adapters/whoop/csv-parser');
      const records = await parseWhoopCSV(csvContent);

      let imported = 0;
      let skipped = 0;

      for (const record of records) {
        const { error } = await supabase.from('daily_physiology').upsert({
          user_id: user!.id,
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
          sources: ['whoop_csv'],
        }, { onConflict: 'user_id,date' });

        if (error) skipped++;
        else imported++;
      }

      // Log the import
      await supabase.from('device_imports').insert({
        user_id: user!.id,
        device_type: 'whoop',
        file_name: file.name,
        rows_imported: imported,
        rows_skipped: skipped,
        status: 'completed',
      });

      setResult({ imported, skipped });
    } catch (err) {
      Alert.alert('Error', 'Failed to import file.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <ThemedText variant="subtitle" style={styles.title}>Import Whoop CSV</ThemedText>
        <ThemedText variant="body" color={COLORS.textSecondary} style={styles.description}>
          Export your data from Whoop and import the CSV file here. This will populate your historical physiology data for baseline calculations.
        </ThemedText>
        <Button
          title="Select CSV File"
          onPress={handleImport}
          loading={importing}
        />
      </Card>

      {result && (
        <Card style={styles.resultCard}>
          <ThemedText variant="subtitle" color={COLORS.success}>
            Import Complete
          </ThemedText>
          <ThemedText variant="body">
            {result.imported} days imported, {result.skipped} skipped
          </ThemedText>
        </Card>
      )}
    </ScrollView>
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
});
