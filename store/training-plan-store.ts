/**
 * Training Plan Store
 *
 * Persisted Zustand store holding the athlete's training plan.
 * Supports manual entry, weekly templates, and future API sync.
 * Template auto-expands into planned sessions for the upcoming week.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileStorage } from '../lib/utils/file-storage';
import type { PlannedSession, WeeklyTemplate } from '../lib/types/training-plan';

interface TrainingPlanState {
  /** Planned sessions keyed by date (YYYY-MM-DD). */
  plannedSessions: Record<string, PlannedSession[]>;
  /** Recurring weekly template (null if no template set). */
  weeklyTemplate: WeeklyTemplate | null;

  // ── Actions ──

  /** Add or update a session for a date. */
  upsertSession: (session: PlannedSession) => void;
  /** Remove a session by date + slot + type. */
  removeSession: (date: string, slot: string, type: string) => void;
  /** Get sessions for a specific date. */
  getSessionsForDate: (date: string) => PlannedSession[];
  /** Set the weekly template. */
  setTemplate: (template: WeeklyTemplate | null) => void;
  /** Expand the template into planned sessions for the next N days. */
  expandTemplate: (fromDate: string, days?: number) => void;
  /** Clear all planned sessions. */
  clearSessions: () => void;
}

/** Format a Date to YYYY-MM-DD. */
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const useTrainingPlanStore = create<TrainingPlanState>()(
  persist(
    (set, get) => ({
      plannedSessions: {},
      weeklyTemplate: null,

      upsertSession: (session) => {
        set((state) => {
          const existing = state.plannedSessions[session.date] ?? [];
          // Replace existing session with same slot+type, or append
          const idx = existing.findIndex(
            (s) => s.slot === session.slot && s.type === session.type,
          );
          const updated = [...existing];
          if (idx >= 0) {
            updated[idx] = session;
          } else {
            updated.push(session);
          }
          return {
            plannedSessions: {
              ...state.plannedSessions,
              [session.date]: updated,
            },
          };
        });
      },

      removeSession: (date, slot, type) => {
        set((state) => {
          const existing = state.plannedSessions[date];
          if (!existing) return state;
          const filtered = existing.filter(
            (s) => !(s.slot === slot && s.type === type),
          );
          const sessions = { ...state.plannedSessions };
          if (filtered.length === 0) {
            delete sessions[date];
          } else {
            sessions[date] = filtered;
          }
          return { plannedSessions: sessions };
        });
      },

      getSessionsForDate: (date) => {
        return get().plannedSessions[date] ?? [];
      },

      setTemplate: (template) => {
        set({ weeklyTemplate: template });
      },

      expandTemplate: (fromDate, days = 7) => {
        const template = get().weeklyTemplate;
        if (!template) return;

        const start = new Date(fromDate + 'T00:00:00');
        const newSessions: Record<string, PlannedSession[]> = { ...get().plannedSessions };

        for (let i = 0; i < days; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const dateStr = toDateStr(d);
          const dow = d.getDay(); // 0=Sun

          // Find template sessions for this day of week
          const templateSessions = template.sessions.filter(
            (s) => s.dayOfWeek === dow,
          );

          if (templateSessions.length === 0) continue;

          // Only add template sessions if no manually-entered sessions exist
          const existing = newSessions[dateStr] ?? [];
          const hasManual = existing.some((s) => s.source === 'manual');
          if (hasManual) continue;

          // Replace template-sourced sessions
          const nonTemplate = existing.filter((s) => s.source !== 'template');
          const expanded: PlannedSession[] = templateSessions.map((ts) => ({
            date: dateStr,
            slot: ts.slot,
            type: ts.type,
            durationMin: ts.durationMin,
            intensityZone: ts.intensityZone,
            source: 'template' as const,
          }));

          newSessions[dateStr] = [...nonTemplate, ...expanded];
        }

        set({ plannedSessions: newSessions });
      },

      clearSessions: () => {
        set({ plannedSessions: {} });
      },
    }),
    {
      name: 'revive-training-plan',
      storage: createJSONStorage(() => fileStorage),
      partialize: (state) => ({
        plannedSessions: state.plannedSessions,
        weeklyTemplate: state.weeklyTemplate,
      }),
    },
  ),
);
