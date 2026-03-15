/**
 * Whoop Developer API v1 client.
 *
 * Endpoints:
 *   GET /v1/recovery      — recovery metrics (HRV, RHR, SpO2, skin temp, respiratory rate)
 *   GET /v1/sleep          — sleep data (duration, stages, performance, consistency, latency)
 *   GET /v1/workout        — workout data (HR, strain, zones, duration, calories)
 *   GET /v1/cycle          — daily strain cycle
 *
 * Uses the Fetch API. OAuth tokens are passed per-request; refresh is
 * handled via refreshAccessToken().
 */

import Constants from 'expo-constants';
import {
  WHOOP_API_BASE,
  WHOOP_AUTH_URL,
  WHOOP_TOKEN_URL,
} from '../../utils/constants';
import { TokenPair } from '../types';

// ─── Whoop raw response shapes ───────────────────────────────────────────────

export interface WhoopRecoveryRecord {
  cycle_id: number;
  sleep_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: string;
  score: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage: number | null;
    skin_temp_celsius: number | null;
  } | null;
}

export interface WhoopSleepRecord {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: string;
  score: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number | null;
    sleep_performance_percentage: number | null;
    sleep_consistency_percentage: number | null;
    sleep_efficiency_percentage: number | null;
  } | null;
}

export interface WhoopWorkoutRecord {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  sport_id: number;
  score_state: string;
  score: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter: number | null;
    altitude_gain_meter: number | null;
    altitude_change_meter: number | null;
    zone_duration: {
      zone_zero_milli: number;
      zone_one_milli: number;
      zone_two_milli: number;
      zone_three_milli: number;
      zone_four_milli: number;
      zone_five_milli: number;
    };
  } | null;
}

export interface WhoopCycleRecord {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string | null;
  timezone_offset: string;
  score_state: string;
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  } | null;
}

interface PaginatedResponse<T> {
  records: T[];
  next_token: string | null;
}

// ─── Sport ID → name mapping (subset of common types) ───────────────────────

const SPORT_MAP: Record<number, string> = {
  0: 'Running',
  1: 'Cycling',
  33: 'CrossFit',
  43: 'Functional Fitness',
  44: 'Weightlifting',
  48: 'Swimming',
  52: 'Yoga',
  63: 'HIIT',
  71: 'Rowing',
  82: 'Walking',
  84: 'Hiking',
  [-1]: 'Activity',
};

export function sportName(sportId: number): string {
  return SPORT_MAP[sportId] ?? 'Activity';
}

// ─── Client ──────────────────────────────────────────────────────────────────

const SCOPES = [
  'read:recovery',
  'read:sleep',
  'read:workout',
  'read:cycles',
  'read:profile',
].join(' ');

export class WhoopApiClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(opts?: {
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
  }) {
    const extra = Constants.expoConfig?.extra ?? {};
    this.clientId = opts?.clientId ?? extra.whoopClientId ?? '';
    this.clientSecret = opts?.clientSecret ?? extra.whoopClientSecret ?? '';
    this.redirectUri = opts?.redirectUri ?? extra.whoopRedirectUri ?? 'revive-metrx://auth/whoop/callback';
  }

  // ── OAuth ──────────────────────────────────────────────────────────────────

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: SCOPES,
    });
    return `${WHOOP_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<TokenPair> {
    const res = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Whoop token exchange failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const res = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Whoop token refresh failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  // ── Data endpoints ─────────────────────────────────────────────────────────

  async getRecovery(
    token: string,
    startDate: string,
    endDate?: string,
  ): Promise<WhoopRecoveryRecord[]> {
    const params = new URLSearchParams({ start: startDate });
    if (endDate) params.set('end', endDate);
    return this.fetchPaginated<WhoopRecoveryRecord>(
      `/v1/recovery?${params}`,
      token,
    );
  }

  async getSleep(
    token: string,
    startDate: string,
    endDate?: string,
  ): Promise<WhoopSleepRecord[]> {
    const params = new URLSearchParams({ start: startDate });
    if (endDate) params.set('end', endDate);
    return this.fetchPaginated<WhoopSleepRecord>(
      `/v1/sleep?${params}`,
      token,
    );
  }

  async getWorkouts(
    token: string,
    startDate: string,
    endDate?: string,
  ): Promise<WhoopWorkoutRecord[]> {
    const params = new URLSearchParams({ start: startDate });
    if (endDate) params.set('end', endDate);
    return this.fetchPaginated<WhoopWorkoutRecord>(
      `/v1/workout?${params}`,
      token,
    );
  }

  async getCycles(
    token: string,
    startDate: string,
    endDate?: string,
  ): Promise<WhoopCycleRecord[]> {
    const params = new URLSearchParams({ start: startDate });
    if (endDate) params.set('end', endDate);
    return this.fetchPaginated<WhoopCycleRecord>(
      `/v1/cycle?${params}`,
      token,
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async fetchPaginated<T>(
    path: string,
    token: string,
  ): Promise<T[]> {
    const results: T[] = [];
    let url: string | null = `${WHOOP_API_BASE}${path}`;

    while (url) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Whoop API error (${res.status}): ${text}`);
      }

      const data = (await res.json()) as PaginatedResponse<T>;
      results.push(...data.records);

      if (data.next_token) {
        const separator: string = url!.includes('?') ? '&' : '?';
        // Strip any previous nextToken param to avoid duplication
        const base: string = url!.replace(/[&?]nextToken=[^&]*/g, '');
        url = `${base}${separator}nextToken=${data.next_token}`;
      } else {
        url = null;
      }
    }

    return results;
  }
}
