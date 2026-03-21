import {
  SPORT_PROFILES,
  getSportProfile,
  getSportProfiles,
  deriveWeightPreset,
  getUnionedRecoveryNeeds,
  getAllStressMarkers,
  SportProfile,
} from '../sport-profiles';

describe('SPORT_PROFILES', () => {
  it('has at least 10 profiles', () => {
    expect(SPORT_PROFILES.length).toBeGreaterThanOrEqual(10);
  });

  it('each profile has required fields', () => {
    SPORT_PROFILES.forEach(p => {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.subsystemStress).toBeDefined();
      expect(p.primaryRecoveryNeeds.length).toBeGreaterThan(0);
      expect(p.recommendedModalities.length).toBeGreaterThan(0);
      expect(p.iaciWeightPreset).toBeTruthy();
    });
  });

  it('all subsystem stress levels are valid', () => {
    const validLevels = ['very_high', 'high', 'moderate', 'low'];
    SPORT_PROFILES.forEach(p => {
      Object.values(p.subsystemStress).forEach(level => {
        expect(validLevels).toContain(level);
      });
    });
  });

  it('all profiles have unique keys', () => {
    const keys = SPORT_PROFILES.map(p => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('all profiles have 7 subsystem stress entries', () => {
    SPORT_PROFILES.forEach(p => {
      expect(Object.keys(p.subsystemStress)).toHaveLength(7);
    });
  });

  it('stress markers have valid subsystem references', () => {
    const validSubsystems = ['autonomic', 'musculoskeletal', 'cardiometabolic', 'sleep', 'metabolic', 'psychological', 'neurological'];
    SPORT_PROFILES.forEach(p => {
      p.stressMarkers.forEach(m => {
        expect(validSubsystems).toContain(m.subsystem);
      });
    });
  });
});

describe('getSportProfile', () => {
  it('returns profile for known key', () => {
    const profile = getSportProfile('running');
    expect(profile).toBeDefined();
    expect(profile!.key).toBe('running');
  });

  it('returns undefined for unknown key', () => {
    expect(getSportProfile('unknown_sport')).toBeUndefined();
  });
});

describe('getSportProfiles', () => {
  it('returns empty for null', () => {
    expect(getSportProfiles(null)).toEqual([]);
  });

  it('returns empty for undefined', () => {
    expect(getSportProfiles(undefined)).toEqual([]);
  });

  it('returns single profile for string key', () => {
    const profiles = getSportProfiles('running');
    expect(profiles).toHaveLength(1);
  });

  it('returns multiple profiles for array', () => {
    const profiles = getSportProfiles(['running', 'cycling']);
    expect(profiles).toHaveLength(2);
  });

  it('filters out unknown keys', () => {
    const profiles = getSportProfiles(['running', 'nonexistent']);
    expect(profiles).toHaveLength(1);
  });
});

describe('deriveWeightPreset', () => {
  it('returns default for empty profiles', () => {
    expect(deriveWeightPreset([])).toBe('default');
  });

  it('returns endurance for endurance sport', () => {
    const profiles = getSportProfiles('running');
    expect(deriveWeightPreset(profiles)).toBe('endurance');
  });

  it('returns power for power sport', () => {
    const profiles = getSportProfiles('powerlifting');
    const preset = deriveWeightPreset(profiles);
    expect(preset).toBe('power');
  });
});

describe('getUnionedRecoveryNeeds', () => {
  it('returns empty for no profiles', () => {
    expect(getUnionedRecoveryNeeds([])).toEqual([]);
  });

  it('returns unique needs from multiple sports', () => {
    const profiles = getSportProfiles(['running', 'crossfit']);
    const needs = getUnionedRecoveryNeeds(profiles);
    // Should be unique
    expect(new Set(needs).size).toBe(needs.length);
    expect(needs.length).toBeGreaterThan(0);
  });
});

describe('getAllStressMarkers', () => {
  it('returns empty for no profiles', () => {
    expect(getAllStressMarkers([])).toEqual([]);
  });

  it('returns markers from sport profile', () => {
    const profiles = getSportProfiles('running');
    const markers = getAllStressMarkers(profiles);
    expect(markers.length).toBeGreaterThan(0);
    markers.forEach(m => {
      expect(m.name).toBeTruthy();
      expect(m.subsystem).toBeTruthy();
    });
  });
});
