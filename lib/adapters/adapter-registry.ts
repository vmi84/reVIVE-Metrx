/**
 * Adapter registry — manages wearable device adapters.
 *
 * Pre-registers the Whoop adapter on import.
 */

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

// Singleton instance with Whoop pre-registered
const registry = new AdapterRegistry();
registry.register(whoopAdapter);

export { registry, AdapterRegistry };
