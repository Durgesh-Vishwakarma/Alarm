import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../../../theme";
import { RINGTONE_OPTIONS } from "../../../data/ringtones";

export const SystemSection = ({ form, set, previewRingtone, adjustSnooze, theme }) => (
  <View style={[s.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
    <View style={s.sectionHeader}>
      <Ionicons name="settings-outline" size={16} color={theme.primary} />
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>Sound & System</Text>
    </View>

    <Text style={[s.label, { color: theme.textMuted }]}>Ringtone</Text>
    <View style={s.ringRow}>
      {RINGTONE_OPTIONS.map((r) => (
        <TouchableOpacity
          key={r.value}
          style={[s.ringChip, { backgroundColor: theme.surface }, form.ringtone === r.value && { backgroundColor: theme.primary }]}
          onPress={() => { set("ringtone", r.value); previewRingtone(r.value); }}
        >
          <Text style={[s.ringTxt, { color: form.ringtone === r.value ? "#FFF" : theme.textSecondary }]}>{r.label}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <View style={s.snoozeRow}>
      <Text style={[s.snoozeLabel, { color: theme.textPrimary }]}>Snooze (min)</Text>
      <View style={s.stepper}>
        <TouchableOpacity onPress={() => adjustSnooze(-1)}><Ionicons name="remove" size={20} color={theme.primary} /></TouchableOpacity>
        <Text style={[s.stepVal, { color: theme.textPrimary }]}>{form.snoozeMinutes}</Text>
        <TouchableOpacity onPress={() => adjustSnooze(1)}><Ionicons name="add" size={20} color={theme.primary} /></TouchableOpacity>
      </View>
    </View>

    <View style={s.toggleRow}>
      <Text style={[s.toggleTxt, { color: theme.textPrimary }]}>Alarm Active</Text>
      <Switch
        value={form.isActive}
        onValueChange={(v) => set("isActive", v)}
        trackColor={{ false: theme.cardBorder, true: theme.primary }}
      />
    </View>
  </View>
);

const s = StyleSheet.create({
  section: { borderRadius: 16, padding: 18, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#8B5CF6", borderWidth: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: typography.family.extraBold, textTransform: "uppercase" },
  label: { fontSize: 10, fontFamily: typography.family.bold, marginBottom: 8, textTransform: "uppercase" },
  ringRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ringChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  ringTxt: { fontSize: 11, fontFamily: typography.family.bold },
  snoozeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  snoozeLabel: { fontFamily: typography.family.bold, fontSize: 14 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepVal: { fontFamily: typography.family.extraBold, fontSize: 14, minWidth: 20, textAlign: "center" },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  toggleTxt: { fontFamily: typography.family.bold, fontSize: 14 },
});
