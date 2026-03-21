/**
 * Wearable adapter interface — all device integrations implement this contract.
 */

import {
  CanonicalPhysiologyRecord,
  DataQualityReport,
} from '../types/canonical';

export interface AdapterConfig {
  deviceType: string;
  label: string;
  supportsOAuth: boolean;
  supportsCSV: boolean;
  supportsWebhook: boolean;
  /** True for adapters that read from on-device data stores (HealthKit, Health Connect). */
  supportsLocalData?: boolean;
}

export interface WearableAdapter {
  config: AdapterConfig;

  // OAuth flow
  getAuthUrl?(): string;
  handleAuthCallback?(code: string): Promise<TokenPair>;
  refreshToken?(refreshToken: string): Promise<TokenPair>;

  // Data fetching (token-based, e.g. Whoop API)
  fetchRecovery?(
    token: string,
    date: string,
  ): Promise<CanonicalPhysiologyRecord>;
  fetchSleep?(token: string, date: string): Promise<CanonicalPhysiologyRecord>;
  fetchWorkouts?(
    token: string,
    startDate: string,
    endDate: string,
  ): Promise<CanonicalPhysiologyRecord[]>;

  // Local data access (HealthKit, Health Connect)
  isAvailable?(): boolean;
  requestPermissions?(): Promise<boolean>;
  fetchLocalData?(
    startDate: string,
    endDate: string,
  ): Promise<CanonicalPhysiologyRecord[]>;

  // CSV import
  parseCSV?(csvContent: string): Promise<CanonicalPhysiologyRecord[]>;

  // Data quality
  assessQuality(record: CanonicalPhysiologyRecord): DataQualityReport;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
