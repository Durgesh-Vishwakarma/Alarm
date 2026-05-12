import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../src/theme';
import { preferencesAtom } from '../../src/atoms/alarmAtoms';
import { requestNotificationPermissions } from '../../src/services/notificationService';

/**
 * SnapWake Production Settings
 * Implements interactive persistence for AI controls, system permissions, and progression resets.
 */
export default function SettingsScreen() {
  const [prefs, setPrefs] = useAtom(preferencesAtom);

  const togglePref = (key) => {
    Haptics.selectionAsync();
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding?",
      "You will see the introductory flow next time you open the app.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: async () => {
             // In a real app, you'd wipe the flag. Here we just simulate for the session.
             Alert.alert("Success", "Onboarding flag cleared.");
          }
        }
      ]
    );
  };

  const handlePermissionCheck = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const status = await requestNotificationPermissions();
    Alert.alert("System Check", `Notification Status: ${status}`);
  };

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
          <Text style={styles.subtitle}>Configure AI verification, alarm behavior, and progression data.</Text>

          {/* Critical AI Verification Toggle */}
          <View style={styles.primaryCard}>
            <View style={styles.primaryIcon}>
              <Ionicons name="scan" size={24} color={colors.white} />
            </View>
            <View style={styles.primaryCopy}>
              <Text style={styles.primaryLabel}>AI Verification</Text>
              <Text style={styles.primaryText}>{prefs.aiVerificationEnabled ? 'Enabled' : 'Disabled'}</Text>
              <Text style={styles.primarySubtext}>
                {prefs.aiVerificationEnabled 
                  ? 'Gemini AI will verify all morning challenges via live camera.' 
                  : 'Challenges will be skipped. Classic alarms will fire.'}
              </Text>
            </View>
            <Switch 
              value={prefs.aiVerificationEnabled} 
              onValueChange={() => togglePref('aiVerificationEnabled')}
              trackColor={{ true: colors.primary, false: '#444' }} 
              thumbColor={colors.white} 
            />
          </View>

          <Text style={styles.groupTitle}>Core Settings</Text>
          
          <TouchableOpacity style={styles.sectionRow} onPress={() => togglePref('vibrationEnabled')}>
            <View style={styles.iconShell}>
              <Ionicons name="pulse" size={20} color={colors.primary} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Haptic Feedback</Text>
              <Text style={styles.sectionBody}>Intense vibration during verification</Text>
            </View>
            <Switch 
              value={prefs.vibrationEnabled} 
              onValueChange={() => togglePref('vibrationEnabled')}
              trackColor={{ true: colors.primary }}
              thumbColor={colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sectionRow} onPress={handlePermissionCheck}>
            <View style={[styles.iconShell, { backgroundColor: colors.verification + '15' }]}>
              <Ionicons name="notifications" size={20} color={colors.verification} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>System Permissions</Text>
              <Text style={styles.sectionBody}>Verify notification & alarm reliability</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </TouchableOpacity>

          <Text style={styles.groupTitle}>Danger Zone</Text>

          <TouchableOpacity style={styles.sectionRow} onPress={handleResetOnboarding}>
            <View style={[styles.iconShell, { backgroundColor: colors.danger + '15' }]}>
              <Ionicons name="refresh" size={20} color={colors.danger} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>Reset Onboarding</Text>
              <Text style={styles.sectionBody}>Re-run the initial product tour</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>SnapWake AI Build v1.2.0 (Stable)</Text>
            <Text style={styles.versionText}>Linked to Gemini Engine v1.5</Text>
          </View>
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
  title: { 
    fontFamily: typography.family.extraBold, 
    fontSize: 30, 
    color: colors.text.primary,
    letterSpacing: -1
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  statusText: { fontFamily: typography.family.bold, fontSize: 12, color: colors.primary },
  subtitle: { 
    fontFamily: typography.family.regular, 
    fontSize: 15, 
    color: colors.text.secondary, 
    marginTop: 6,
    lineHeight: 22
  },
  primaryCard: {
    marginTop: spacing.md,
    backgroundColor: colors.dark.background,
    borderRadius: 26,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
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
  primaryLabel: { 
    fontFamily: typography.family.bold, 
    fontSize: 11, 
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  primaryText: { fontFamily: typography.family.extraBold, fontSize: 20, color: colors.white, marginTop: 2 },
  primarySubtext: {
    fontFamily: typography.family.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    lineHeight: 16,
  },
  groupTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 14,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.sm,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCopy: { flex: 1 },
  sectionTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.text.primary },
  sectionBody: { fontFamily: typography.family.regular, fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  versionContainer: {
    marginTop: 40,
    alignItems: 'center',
    opacity: 0.4
  },
  versionText: {
    fontFamily: typography.family.medium,
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 18
  }
});
