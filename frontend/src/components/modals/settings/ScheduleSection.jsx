import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../../../theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const ScheduleSection = ({ form, set, toggleDay, theme }) => (
  <View style={[s.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
    <View style={s.sectionHeader}>
      <Ionicons name="calendar-outline" size={16} color={theme.primary} />
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>Schedule</Text>
    </View>

    <View style={s.dayRow}>
      {DAYS.map((day) => {
        const active = form.repeatDays.includes(day);
        return (
          <TouchableOpacity
            key={day}
            style={[s.dayChip, { backgroundColor: theme.surface }, active && { backgroundColor: theme.primary }]}
            onPress={() => toggleDay(day)}
          >
            <Text style={[s.dayChipTxt, { color: theme.textMuted }, active && { color: "#FFF" }]}>
              {day.charAt(0)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    <View style={[s.labelRow, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
      <Ionicons name="pricetag-outline" size={16} color={theme.textMuted} />
      <TextInput
        style={[s.labelInput, { color: theme.textPrimary }]}
        value={form.label}
        onChangeText={(v) => set("label", v)}
        placeholder="Alarm label (optional)"
        placeholderTextColor={theme.textMuted}
      />
    </View>
  </View>
);

const s = StyleSheet.create({
  section: { borderRadius: 16, padding: 18, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#3B82F6", borderWidth: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: typography.family.extraBold, textTransform: "uppercase" },
  dayRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dayChip: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  dayChipTxt: { fontFamily: typography.family.bold, fontSize: 13 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1 },
  labelInput: { flex: 1, fontSize: 15, fontFamily: typography.family.bold },
});
