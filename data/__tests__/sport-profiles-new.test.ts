import { getSportProfile, SPORT_PROFILES } from '../sport-profiles';

describe('New Sport Profiles (v2.7.0)', () => {
  const newKeys = ['ultramarathon', 'biathlon', 'track_field'];

  it.each(newKeys)('%s profile exists', (key) => {
    const profile = getSportProfile(key);
    expect(profile).toBeDefined();
    expect(profile!.key).toBe(key);
  });

  it('ultramarathon is endurance category with correct stress pattern', () => {
    const p = getSportProfile('ultramarathon')!;
    expect(p.category).toBe('endurance');
    expect(p.iaciWeightPreset).toBe('endurance');
    expect(p.subsystemStress.musculoskeletal).toBe('very_high');
    expect(p.subsystemStress.metabolic).toBe('very_high');
    expect(p.primaryRecoveryNeeds).toContain('musculoskeletal');
    expect(p.primaryRecoveryNeeds).toContain('metabolic');
  });

  it('biathlon is endurance category with autonomic stress', () => {
    const p = getSportProfile('biathlon')!;
    expect(p.category).toBe('endurance');
    expect(p.subsystemStress.autonomic).toBe('high');
    expect(p.subsystemStress.cardiometabolic).toBe('very_high');
    expect(p.primaryRecoveryNeeds).toContain('autonomic');
  });

  it('track_field is field_court category with power preset', () => {
    const p = getSportProfile('track_field')!;
    expect(p.category).toBe('field_court');
    expect(p.iaciWeightPreset).toBe('power');
    expect(p.subsystemStress.musculoskeletal).toBe('very_high');
    expect(p.primaryRecoveryNeeds).toContain('musculoskeletal');
  });

  it('all new profiles have stress markers and recommended modalities', () => {
    for (const key of newKeys) {
      const p = getSportProfile(key)!;
      expect(p.stressMarkers.length).toBeGreaterThan(0);
      expect(p.recommendedModalities.length).toBeGreaterThan(0);
    }
  });

  it('total sport profiles count increased', () => {
    expect(SPORT_PROFILES.length).toBeGreaterThanOrEqual(30); // was ~27, now +3
  });
});
