/**
 * Tests for the generic data source registry and feed type utilities.
 *
 * Ensures the source-agnostic layer works for all known and unknown devices.
 */

import { getSourceMeta, DEVICE_SOURCE_REGISTRY } from '../feed';

describe('Device Source Registry', () => {
  it('returns correct metadata for all known sources', () => {
    expect(getSourceMeta('whoop').label).toBe('WHOOP');
    expect(getSourceMeta('garmin').label).toBe('Garmin');
    expect(getSourceMeta('oura').label).toBe('Oura');
    expect(getSourceMeta('apple_health').label).toBe('Apple Health');
    expect(getSourceMeta('polar').label).toBe('Polar');
    expect(getSourceMeta('coros').label).toBe('COROS');
    expect(getSourceMeta('manual').label).toBe('Manual');
    expect(getSourceMeta('inherited').label).toBe('Yesterday');
    expect(getSourceMeta('computed').label).toBe('Computed');
  });

  it('returns valid hex colors for all known sources', () => {
    for (const [key, meta] of Object.entries(DEVICE_SOURCE_REGISTRY)) {
      expect(meta.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('gracefully handles unknown source keys', () => {
    const unknown = getSourceMeta('fitbit');
    expect(unknown.label).toBe('Fitbit');
    expect(unknown.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('converts snake_case unknown sources to title case', () => {
    expect(getSourceMeta('my_custom_device').label).toBe('My Custom Device');
  });

  it('handles empty string source', () => {
    const meta = getSourceMeta('');
    expect(meta.label).toBe('');
    expect(meta.color).toBeDefined();
  });
});
