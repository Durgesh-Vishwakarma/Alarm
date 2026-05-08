import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/theme';

const SECTIONS = [
  ['Alarm Behavior', 'Exact timing, snooze guard, full-screen wake mode', 'alarm-outline', true],
  ['AI Verification', 'Strictness, multi-step checks, offline fallback', 'scan-outline', true],
  ['Appearance', 'Theme, typography, motion, and compact layout', 'color-palette-outline', false],
  ['Notification Permissions', 'Ringtone, critical alerts, background reliability', 'notifications-outline', false],
  ['Backup & Sync', 'Cloud sync for alarms, streaks, and reference images', 'cloud-upload-outline', false],
  ['Privacy', 'Camera retention, AI logs, and local-only mode', 'lock-closed-outline', true],
];

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.statusPill}>
              <Ionicons name="shield-checkmark" size={15} color={colors.primary} />
              <Text style={styles.statusText}>Secure</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Production controls for alarms, AI verification, and privacy.</Text>

          <View style={styles.primaryCard}>
            <View style={styles.primaryIcon}>
              <Ionicons name="scan" size={24} color={colors.white} />
            </View>
            <View style={styles.primaryCopy}>
              <Text style={styles.primaryLabel}>AI Verification</Text>
              <Text style={styles.primaryText}>Strict live-camera dismissal</Text>
              <Text style={styles.primarySubtext}>Expo Go uses preview mode. Dev builds enable native alarm services.</Text>
            </View>
            <Switch value trackColor={{ true: colors.primary }} thumbColor={colors.white} />
          </View>

          <Text style={styles.groupTitle}>Preferences</Text>
          {SECTIONS.map(([title, body, icon, enabled]) => (
            <View key={title} style={styles.sectionRow}>
              <View style={styles.iconShell}>
                <Ionicons name={icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionBody}>{body}</Text>
              </View>
              {enabled ? (
                <View style={styles.enabledDot} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: typography.family.extraBold, fontSize: 30, color: colors.text.primary },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F0D7D9',
  },
  statusText: { fontFamily: typography.family.bold, fontSize: 12, color: colors.primary },
  subtitle: { fontFamily: typography.family.regular, fontSize: 15, color: colors.text.secondary, marginTop: 6 },
  primaryCard: {
    marginTop: spacing.md,
    backgroundColor: colors.text.primary,
    borderRadius: 26,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryCopy: { flex: 1 },
  primaryLabel: { fontFamily: typography.family.bold, fontSize: 12, color: 'rgba(255,255,255,0.66)' },
  primaryText: { fontFamily: typography.family.extraBold, fontSize: 18, color: colors.white, marginTop: 3 },
  primarySubtext: {
    fontFamily: typography.family.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 4,
    lineHeight: 15,
  },
  groupTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 15,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.sm,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCopy: { flex: 1 },
  sectionTitle: { fontFamily: typography.family.bold, fontSize: 15, color: colors.text.primary },
  sectionBody: { fontFamily: typography.family.regular, fontSize: 12, color: colors.text.secondary, marginTop: 3 },
  enabledDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
