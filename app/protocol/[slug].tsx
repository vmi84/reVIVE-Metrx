import { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { ProtocolVideoPlayer } from '@/components/recovery/ProtocolVideoPlayer';
import { COLORS } from '@/lib/utils/constants';
import { RecoveryProtocol } from '@/lib/types/protocols';
import localProtocols from '@/data/recovery-protocols.json';

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const EVIDENCE_COLORS: Record<string, string> = {
  strong: COLORS.success,
  moderate: COLORS.warning,
  emerging: COLORS.primary,
};

const EVIDENCE_ICONS: Record<string, string> = {
  strong: '■',
  moderate: '▲',
  emerging: '○',
};

export default function ProtocolDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const protocol = useMemo<RecoveryProtocol | undefined>(() => {
    const entry = (localProtocols as any[]).find((p) => p.slug === slug);
    if (!entry) return undefined;
    // Map local JSON fields to RecoveryProtocol shape
    return {
      id: entry.id,
      name: entry.name,
      slug: entry.slug,
      series: entry.series,
      modalityType: entry.modalityType ?? 'active',
      cnsLowAvoid: entry.cnsLowAvoid ?? false,
      offDayOnly: entry.offDayOnly ?? false,
      primarySystem: entry.primarySystem ?? '',
      secondarySystems: entry.secondarySystems ?? [],
      iaciSubsystemsTargeted: entry.iaciSubsystemsTargeted ?? [],
      targetAreasPrimary: entry.targetAreasPrimary ?? [],
      targetAreasSecondary: entry.targetAreasSecondary ?? [],
      benefits: entry.benefits ?? [],
      equipmentNeeded: entry.equipmentNeeded ?? [],
      evidenceLevel: entry.evidenceLevel ?? null,
      doseMin: entry.doseMin ?? null,
      doseSweetSpot: entry.doseSweetSpot ?? null,
      doseUpperLimit: entry.doseUpperLimit ?? null,
      instructions: entry.instructions ?? null,
      avoidCautions: entry.avoidCautions ?? null,
      idealTiming: entry.idealTiming ?? null,
      evidenceNotes: entry.evidenceNotes ?? null,
      athleteTidbit: entry.athleteTidbit ?? null,
      athleteCaution: entry.athleteCaution ?? null,
      protocolClasses: entry.protocolClasses ?? [],
      phenotypesRecommended: entry.phenotypesRecommended ?? [],
      phenotypesAvoid: entry.phenotypesAvoid ?? [],
      environment: entry.environment ?? [],
      videoUrl: entry.videoUrl ?? null,
    } as RecoveryProtocol;
  }, [slug]);

  if (!protocol) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Protocol' }} />
        <View style={styles.notFound}>
          <ThemedText variant="body" color={COLORS.textSecondary}>
            Protocol not found.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: protocol.name, headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <Card style={styles.section}>
          <ThemedText variant="title" style={styles.protocolName}>
            {protocol.name}
          </ThemedText>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <ThemedText variant="caption" style={styles.badgeText}>
                {formatLabel(protocol.series)}
              </ThemedText>
            </View>
            <View style={styles.badge}>
              <ThemedText variant="caption" style={styles.badgeText}>
                {formatLabel(protocol.modalityType)}
              </ThemedText>
            </View>
            {protocol.evidenceLevel && (
              <View style={[styles.badge, { backgroundColor: (EVIDENCE_COLORS[protocol.evidenceLevel] ?? COLORS.primary) + '20' }]}>
                <ThemedText variant="caption" style={[styles.badgeText, { color: EVIDENCE_COLORS[protocol.evidenceLevel] ?? COLORS.primary }]}>
                  {EVIDENCE_ICONS[protocol.evidenceLevel]} {formatLabel(protocol.evidenceLevel)}
                </ThemedText>
              </View>
            )}
            {protocol.cnsLowAvoid && (
              <View style={[styles.badge, styles.warningBadge]}>
                <ThemedText variant="caption" style={styles.warningBadgeText}>
                  CNS LOW: AVOID
                </ThemedText>
              </View>
            )}
          </View>
        </Card>

        {/* Demo Video */}
        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Demo Video
          </ThemedText>
          <ProtocolVideoPlayer videoUrl={protocol.videoUrl} protocolName={protocol.name} />
        </Card>

        {/* Instructions */}
        {protocol.instructions && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Instructions
            </ThemedText>
            <ThemedText variant="body" color={COLORS.textSecondary} style={styles.bodyText}>
              {protocol.instructions}
            </ThemedText>
          </Card>
        )}

        {/* Dosage */}
        {(protocol.doseMin || protocol.doseSweetSpot || protocol.doseUpperLimit) && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Dosage
            </ThemedText>
            <View style={styles.doseRow}>
              {protocol.doseMin && (
                <View style={styles.doseItem}>
                  <ThemedText variant="caption" color={COLORS.textMuted}>Minimum</ThemedText>
                  <ThemedText variant="body" style={styles.doseValue}>{protocol.doseMin}</ThemedText>
                </View>
              )}
              {protocol.doseSweetSpot && (
                <View style={[styles.doseItem, styles.doseHighlight]}>
                  <ThemedText variant="caption" color={COLORS.primary}>Sweet Spot</ThemedText>
                  <ThemedText variant="body" color={COLORS.primary} style={styles.doseValue}>
                    {protocol.doseSweetSpot}
                  </ThemedText>
                </View>
              )}
              {protocol.doseUpperLimit && (
                <View style={styles.doseItem}>
                  <ThemedText variant="caption" color={COLORS.textMuted}>Upper Limit</ThemedText>
                  <ThemedText variant="body" style={styles.doseValue}>{protocol.doseUpperLimit}</ThemedText>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Ideal Timing */}
        {protocol.idealTiming && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Ideal Timing
            </ThemedText>
            <ThemedText variant="body" color={COLORS.textSecondary} style={styles.bodyText}>
              {protocol.idealTiming}
            </ThemedText>
          </Card>
        )}

        {/* Cautions */}
        {protocol.avoidCautions && (
          <Card style={[styles.section, styles.cautionCard]}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              ⚠️ Cautions
            </ThemedText>
            <ThemedText variant="body" color={COLORS.warning} style={styles.bodyText}>
              {protocol.avoidCautions}
            </ThemedText>
          </Card>
        )}

        {/* Equipment */}
        {protocol.equipmentNeeded.length > 0 && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Equipment Needed
            </ThemedText>
            <View style={styles.tagRow}>
              {protocol.equipmentNeeded.map((item) => (
                <View key={item} style={styles.tag}>
                  <ThemedText variant="caption" color={COLORS.text} style={styles.tagText}>
                    {formatLabel(item)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Target Areas */}
        {(protocol.targetAreasPrimary.length > 0 || protocol.targetAreasSecondary.length > 0) && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Target Areas
            </ThemedText>
            {protocol.targetAreasPrimary.length > 0 && (
              <>
                <ThemedText variant="caption" color={COLORS.textMuted} style={styles.subLabel}>Primary</ThemedText>
                <View style={styles.tagRow}>
                  {protocol.targetAreasPrimary.map((area) => (
                    <View key={area} style={[styles.tag, styles.primaryTag]}>
                      <ThemedText variant="caption" color={COLORS.primary} style={styles.tagText}>
                        {formatLabel(area)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </>
            )}
            {protocol.targetAreasSecondary.length > 0 && (
              <>
                <ThemedText variant="caption" color={COLORS.textMuted} style={[styles.subLabel, { marginTop: 10 }]}>Secondary</ThemedText>
                <View style={styles.tagRow}>
                  {protocol.targetAreasSecondary.map((area) => (
                    <View key={area} style={styles.tag}>
                      <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.tagText}>
                        {formatLabel(area)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Card>
        )}

        {/* Systems Targeted */}
        {protocol.iaciSubsystemsTargeted.length > 0 && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              IACI Systems Targeted
            </ThemedText>
            <View style={styles.tagRow}>
              {protocol.iaciSubsystemsTargeted.map((sys) => (
                <View key={sys} style={[styles.tag, styles.systemTag]}>
                  <ThemedText variant="caption" color={COLORS.primary} style={[styles.tagText, { fontWeight: '600' }]}>
                    {formatLabel(sys)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Evidence */}
        {protocol.evidenceNotes && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Evidence Notes
            </ThemedText>
            <ThemedText variant="body" color={COLORS.textSecondary} style={styles.bodyText}>
              {protocol.evidenceNotes}
            </ThemedText>
          </Card>
        )}

        {/* Athlete Tips */}
        {(protocol.athleteTidbit || protocol.athleteCaution) && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Athlete Tips
            </ThemedText>
            {protocol.athleteTidbit && (
              <View style={styles.tipBox}>
                <ThemedText variant="caption" color={COLORS.success} style={styles.tipLabel}>
                  💡 Pro Tip
                </ThemedText>
                <ThemedText variant="body" color={COLORS.textSecondary} style={styles.bodyText}>
                  {protocol.athleteTidbit}
                </ThemedText>
              </View>
            )}
            {protocol.athleteCaution && (
              <View style={[styles.tipBox, styles.cautionTip]}>
                <ThemedText variant="caption" color={COLORS.warning} style={styles.tipLabel}>
                  ⚠️ Caution
                </ThemedText>
                <ThemedText variant="body" color={COLORS.textSecondary} style={styles.bodyText}>
                  {protocol.athleteCaution}
                </ThemedText>
              </View>
            )}
          </Card>
        )}

        {/* Environment */}
        {protocol.environment.length > 0 && (
          <Card style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Environment
            </ThemedText>
            <View style={styles.tagRow}>
              {protocol.environment.map((env) => (
                <View key={env} style={styles.tag}>
                  <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.tagText}>
                    {formatLabel(env)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 16,
  },
  protocolName: {
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  warningBadge: {
    backgroundColor: '#3D1F00',
  },
  warningBadgeText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  bodyText: {
    lineHeight: 22,
  },
  doseRow: {
    gap: 12,
  },
  doseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  doseHighlight: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    borderBottomWidth: 0,
  },
  doseValue: {
    fontWeight: '600',
    marginTop: 4,
  },
  cautionCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
  },
  primaryTag: {
    backgroundColor: COLORS.primary + '20',
  },
  systemTag: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  subLabel: {
    marginBottom: 6,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipBox: {
    backgroundColor: COLORS.success + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cautionTip: {
    backgroundColor: COLORS.warning + '10',
  },
  tipLabel: {
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 20,
  },
});
