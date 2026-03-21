import {
  TRAINING_RECOVERY_MAP,
  getRecoveryModalities,
  getModalitiesByCategory,
  getAllModalityKeys,
  TrainingRecoveryProfile,
} from '../training-recovery-map';

describe('TRAINING_RECOVERY_MAP', () => {
  const allKeys = Object.keys(TRAINING_RECOVERY_MAP);
  const allEntries = Object.values(TRAINING_RECOVERY_MAP);

  it('has exactly 39 modalities', () => {
    expect(allKeys).toHaveLength(39);
  });

  it('each entry has required fields', () => {
    allEntries.forEach(entry => {
      expect(entry.label).toBeTruthy();
      expect(entry.primarySubsystems.length).toBeGreaterThan(0);
      expect(entry.intensityGuidance).toBeDefined();
      expect(entry.intensityGuidance.recoveryZone).toBeTruthy();
      expect(entry.intensityGuidance.loadingThreshold).toBeTruthy();
      expect(entry.evidenceLevel).toBeTruthy();
      expect(entry.durationRange).toBeDefined();
      expect(entry.category).toBeTruthy();
    });
  });

  it('all subsystem keys are valid', () => {
    const validKeys = ['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep', 'metabolic', 'psychological', 'neurological'];
    allEntries.forEach(entry => {
      entry.primarySubsystems.forEach(k => expect(validKeys).toContain(k));
      entry.secondarySubsystems.forEach(k => expect(validKeys).toContain(k));
    });
  });

  it('evidence levels are valid', () => {
    const validLevels = ['strong', 'moderate', 'emerging'];
    allEntries.forEach(entry => {
      expect(validLevels).toContain(entry.evidenceLevel);
    });
  });

  it('duration ranges are ordered (min <= sweet <= max)', () => {
    allEntries.forEach(entry => {
      const { min, sweet, max } = entry.durationRange;
      expect(min).toBeLessThanOrEqual(sweet);
      expect(sweet).toBeLessThanOrEqual(max);
    });
  });

  it('has 8 performance modalities', () => {
    const performance = allEntries.filter(e => e.isPerformanceModality);
    expect(performance).toHaveLength(8);
  });

  it('iaciFloor is non-negative for all entries', () => {
    allEntries.forEach(entry => {
      expect(entry.iaciFloor).toBeGreaterThanOrEqual(0);
    });
  });

  it('all entries have examples array', () => {
    allEntries.forEach(entry => {
      expect(Array.isArray(entry.examples)).toBe(true);
    });
  });
});

describe('getRecoveryModalities', () => {
  it('returns only non-performance modalities', () => {
    const recovery = getRecoveryModalities();
    recovery.forEach(m => {
      expect(m.isPerformanceModality).toBe(false);
    });
  });

  it('returns 31 recovery modalities', () => {
    const recovery = getRecoveryModalities();
    expect(recovery).toHaveLength(31);
  });
});

describe('getModalitiesByCategory', () => {
  it('returns mind_body modalities', () => {
    const mindBody = getModalitiesByCategory('mind_body');
    expect(mindBody.length).toBeGreaterThan(0);
    mindBody.forEach(m => expect(m.category).toBe('mind_body'));
  });

  it('returns empty for unknown category', () => {
    const result = getModalitiesByCategory('nonexistent' as any);
    expect(result).toHaveLength(0);
  });
});

describe('getAllModalityKeys', () => {
  it('returns all 39 keys', () => {
    const keys = getAllModalityKeys();
    expect(keys).toHaveLength(39);
  });

  it('keys match TRAINING_RECOVERY_MAP keys', () => {
    const keys = getAllModalityKeys();
    const mapKeys = Object.keys(TRAINING_RECOVERY_MAP);
    expect(keys.sort()).toEqual(mapKeys.sort());
  });
});
