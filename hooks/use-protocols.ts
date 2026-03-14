import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { useDailyStore } from '../store/daily-store';
import { RecoveryProtocol } from '../lib/types/protocols';

export function useProtocols() {
  const { user } = useAuthStore();
  const { iaci } = useDailyStore();
  const [protocols, setProtocols] = useState<RecoveryProtocol[]>([]);
  const [recommended, setRecommended] = useState<RecoveryProtocol[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all protocols
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from('recovery_protocols')
        .select('*')
        .order('series', { ascending: true });

      if (data) {
        setProtocols(data.map(mapRow));
      }
      setLoading(false);
    }
    fetch();
  }, []);

  // Filter recommended based on current IACI
  useEffect(() => {
    if (!iaci || protocols.length === 0) return;

    const phenotypeKey = iaci.phenotype.key;
    const protocolClass = iaci.protocol.protocolClass;
    const autonomicScore = iaci.subsystemScores.autonomic.score;
    const recommendedSlugs = iaci.protocol.recommendedModalities;

    const filtered = protocols.filter(p => {
      // Constraint enforcement
      if (p.cnsLowAvoid && autonomicScore < 40) return false;
      if (p.offDayOnly) return false; // TODO: check if training is planned

      // Match by recommended slugs first
      if (recommendedSlugs.includes(p.slug)) return true;

      // Match by protocol class
      if (p.protocolClasses.includes(protocolClass)) return true;

      // Match by phenotype
      if (p.phenotypesRecommended.includes(phenotypeKey)) return true;

      return false;
    });

    // Sort: recommended slugs first, then by phenotype match
    filtered.sort((a, b) => {
      const aIdx = recommendedSlugs.indexOf(a.slug);
      const bIdx = recommendedSlugs.indexOf(b.slug);
      if (aIdx !== -1 && bIdx === -1) return -1;
      if (aIdx === -1 && bIdx !== -1) return 1;
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      return 0;
    });

    setRecommended(filtered);
  }, [iaci, protocols]);

  const logProtocol = useCallback(async (
    protocolId: string,
    durationMinutes: number,
    effectiveness: number,
  ) => {
    if (!user?.id) return;

    await supabase.from('recovery_logs').insert({
      user_id: user.id,
      protocol_id: protocolId,
      date: new Date().toISOString().split('T')[0],
      duration_minutes: durationMinutes,
      subjective_effectiveness: effectiveness,
    });
  }, [user?.id]);

  return { protocols, recommended, loading, logProtocol };
}

function mapRow(row: any): RecoveryProtocol {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    series: row.series,
    modalityType: row.modality_type,
    cnsLowAvoid: row.cns_low_avoid,
    offDayOnly: row.off_day_only,
    primarySystem: row.primary_system,
    secondarySystems: row.secondary_systems ?? [],
    iaciSubsystemsTargeted: row.iaci_subsystems_targeted ?? [],
    targetAreasPrimary: row.target_areas_primary ?? [],
    targetAreasSecondary: row.target_areas_secondary ?? [],
    benefits: row.benefits ?? [],
    equipmentNeeded: row.equipment_needed ?? [],
    evidenceLevel: row.evidence_level,
    doseMin: row.dose_min,
    doseSweetSpot: row.dose_sweet_spot,
    doseUpperLimit: row.dose_upper_limit,
    instructions: row.instructions,
    avoidCautions: row.avoid_cautions,
    idealTiming: row.ideal_timing,
    evidenceNotes: row.evidence_notes,
    athleteTidbit: row.athlete_tidbit,
    athleteCaution: row.athlete_caution,
    protocolClasses: row.protocol_classes ?? [],
    phenotypesRecommended: row.phenotypes_recommended ?? [],
    phenotypesAvoid: row.phenotypes_avoid ?? [],
    environment: row.environment ?? [],
  };
}
