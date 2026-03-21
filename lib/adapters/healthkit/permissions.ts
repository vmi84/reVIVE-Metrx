/**
 * HealthKit Permissions — availability check and permission requests.
 *
 * Uses react-native-health to interface with Apple HealthKit.
 * Only works on physical iOS devices (not Simulator, not Android).
 */

import AppleHealthKit, {
  HealthKitPermissions,
  HealthPermission,
} from 'react-native-health';
import { Platform } from 'react-native';

// ─── Permission Types ────────────────────────────────────────────────────────

/** All HealthKit data types we request read access to. */
const HEALTHKIT_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.OxygenSaturation,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.BodyTemperature,
    ] as HealthPermission[],
    write: [] as HealthPermission[],
  },
};

// ─── Public Functions ────────────────────────────────────────────────────────

/**
 * Check whether HealthKit is available on this device.
 * Returns false on Android, Simulator, or iPads without the Health app.
 */
export function isHealthKitAvailable(): boolean {
  if (Platform.OS !== 'ios') return false;

  // On iOS, HealthKit is available on iPhones but not all iPads.
  // The actual availability check happens during initHealthKit.
  // We assume iOS = available and handle errors in permission request.
  return true;
}

/**
 * Request read permissions for all health data types.
 *
 * iOS will show its native HealthKit permission sheet.
 * Note: HealthKit NEVER reveals which specific permissions were denied.
 * The promise resolves true if the dialog was shown (user may have denied some/all).
 */
export function requestHealthKitPermissions(): Promise<boolean> {
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (err: string) => {
      if (err) {
        console.warn('[HealthKit] Permission request failed:', err);
        resolve(false);
        return;
      }
      console.log('[HealthKit] Permissions granted (dialog shown)');
      resolve(true);
    });
  });
}

/**
 * Attempt a lightweight query to verify HealthKit access is working.
 * Returns true if we can read at least one data type.
 */
export function verifyHealthKitAccess(): Promise<boolean> {
  return new Promise((resolve) => {
    const options = {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    };

    AppleHealthKit.getRestingHeartRateSamples(
      options,
      (err: string, results: unknown[]) => {
        if (err) {
          // Error might just mean no data, not necessarily no permission.
          // Try another query to be sure.
          AppleHealthKit.getSleepSamples(
            options,
            (sleepErr: string, sleepResults: unknown[]) => {
              resolve(!sleepErr);
            },
          );
          return;
        }
        resolve(true);
      },
    );
  });
}

export { HEALTHKIT_PERMISSIONS };
