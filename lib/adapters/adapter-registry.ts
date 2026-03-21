/**
 * Adapter registry — manages wearable device adapters.
 *
 * Pre-registers the Whoop adapter on import.
 */

/**
 * Adapter registry — manages wearable device adapters.
 *
 * Pre-registers the Whoop and Apple HealthKit adapters on import.
 */

import { Platform } from 'react-native';
import { WearableAdapter } from './types';
import { whoopAdapter } from './whoop';

class AdapterRegistry {
  private adapters = new Map<string, WearableAdapter>();

  register(adapter: WearableAdapter): void {
    const key = adapter.config.deviceType.toLowerCase();
    if (this.adapters.has(key)) {
      throw new Error(`Adapter already registered for device type: ${key}`);
    }
    this.adapters.set(key, adapter);
  }

  getAdapter(deviceType: string): WearableAdapter | undefined {
    return this.adapters.get(deviceType.toLowerCase());
  }

  listAdapters(): WearableAdapter[] {
    return Array.from(this.adapters.values());
  }
}

// Singleton instance with adapters pre-registered
const registry = new AdapterRegistry();
registry.register(whoopAdapter);

// HealthKit only available on iOS — lazy-register to avoid import errors on Android
if (Platform.OS === 'ios') {
  try {
    const { healthKitAdapter } = require('./healthkit');
    registry.register(healthKitAdapter);
  } catch (err) {
    console.warn('[AdapterRegistry] HealthKit adapter not available:', err);
  }
}

export { registry, AdapterRegistry };
