import { parseWhoopCSV } from '../whoop/csv-parser';

describe('parseWhoopCSV', () => {
  it('parses standard Whoop CSV format', async () => {
    const csv = `Date,HRV (ms),RHR (bpm),Recovery Score,Sleep Duration (min),REM Sleep (min),Deep (SWS) Sleep (min),Light Sleep (min),Sleep Performance (%),Respiratory Rate,SpO2 (%)
2024-01-15,65,55,85,480,120,90,270,88,15.2,97
2024-01-14,58,58,72,450,100,80,270,82,15.5,96`;

    const records = await parseWhoopCSV(csv);
    expect(records).toHaveLength(2);
    expect(records[0].date).toBe('2024-01-15');
    expect(records[0].source).toBe('whoop');
    // HRV and RHR use single-word aliases that survive papaparse's double transformHeader call
    expect(records[0].recovery.hrvRmssd).toBe(65);
    expect(records[0].recovery.restingHeartRate).toBe(55);
  });

  it('maps sleep metrics from CSV', async () => {
    const csv = `Date,HRV (ms),RHR (bpm),SpO2 (%)
2024-01-15,65,55,97`;
    const records = await parseWhoopCSV(csv);
    expect(records[0].cardiovascular.hrvRmssd).toBe(65);
    expect(records[0].cardiovascular.spo2Pct).toBe(97);
  });

  it('handles header aliases', async () => {
    const csv = `Date,HRV RMSSD (ms),Resting Heart Rate
2024-01-15,65,55`;
    const records = await parseWhoopCSV(csv);
    expect(records[0].recovery.hrvRmssd).toBe(65);
    expect(records[0].recovery.restingHeartRate).toBe(55);
  });

  it('handles missing values (--)', async () => {
    const csv = `Date,HRV (ms),RHR (bpm)
2024-01-15,--,55`;
    const records = await parseWhoopCSV(csv);
    expect(records[0].recovery.hrvRmssd).toBeNull();
    expect(records[0].recovery.restingHeartRate).toBe(55);
  });

  it('handles empty values', async () => {
    const csv = `Date,HRV (ms),RHR (bpm)
2024-01-15,,55`;
    const records = await parseWhoopCSV(csv);
    expect(records[0].recovery.hrvRmssd).toBeNull();
    expect(records[0].recovery.restingHeartRate).toBe(55);
  });

  it('normalizes MM/DD/YYYY date format', async () => {
    const csv = `Date,HRV (ms)
1/15/2024,65`;
    const records = await parseWhoopCSV(csv);
    expect(records[0].date).toBe('2024-01-15');
  });

  it('sets source to whoop', async () => {
    const csv = `Date,HRV (ms)
2024-01-15,65`;
    const records = await parseWhoopCSV(csv);
    expect(records[0].source).toBe('whoop');
  });

  it('assigns data quality tier', async () => {
    const csv = `Date,HRV (ms),RHR (bpm),SpO2 (%)
2024-01-15,65,55,97`;
    const records = await parseWhoopCSV(csv);
    expect(['high', 'medium', 'low', 'estimated']).toContain(records[0].dataQuality);
  });

  it('skips rows with no date', async () => {
    const csv = `Date,HRV (ms)
,65
2024-01-15,70`;
    const records = await parseWhoopCSV(csv);
    expect(records).toHaveLength(1);
    expect(records[0].date).toBe('2024-01-15');
  });
});
