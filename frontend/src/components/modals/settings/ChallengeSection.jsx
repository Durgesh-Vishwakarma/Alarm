import { View, Text, TouchableOpacity, TextInput, StyleSheet, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../../../theme";
import { AI_CHALLENGES, DIFFICULTY_LEVELS, STRICTNESS_LEVELS, getChallengeById } from "../../../data/challengeCatalog";

const CUSTOM_CHALLENGE = { id: "custom", title: "Custom", icon: "create-outline", difficulty: "Focused", verificationTips: "Describe it." };
const ALL_CHALLENGES = [...AI_CHALLENGES, CUSTOM_CHALLENGE];

export const ChallengeSection = ({ form, set, selectChallenge, extractTargets, theme }) => {
  const { width } = useWindowDimensions();
  const tileWidth = Math.floor((width - 68) / 2);

  return (
    <View style={[s.section, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={s.sectionHeader}>
        <Ionicons name="rocket-outline" size={16} color={theme.primary} />
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>Wake-up Challenge</Text>
      </View>

      <View style={s.grid}>
        {ALL_CHALLENGES.map((c) => {
          const on = form.challengeId === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[s.cBox, { width: tileWidth, backgroundColor: theme.surface, borderColor: theme.cardBorder }, on && { borderColor: theme.primary, backgroundColor: theme.heroCard }]}
              onPress={() => selectChallenge(c)}
            >
              <Ionicons name={c.icon} size={20} color={on ? theme.primary : theme.textMuted} />
              <Text style={[s.cTitle, { color: on ? theme.textPrimary : theme.textSecondary }]}>{c.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {form.challengeId === "custom" && (
        <View style={[s.customBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <TextInput
            style={[s.customInput, { color: theme.textPrimary }]}
            placeholder="What should AI look for?"
            placeholderTextColor={theme.textMuted}
            value={form.customTask}
            onChangeText={(v) => set("customTask", v)}
            multiline
            maxLength={120}
          />
        </View>
      )}

      <Text style={[s.label, { color: theme.textMuted }]}>Strictness</Text>
      <View style={s.row}>
        {STRICTNESS_LEVELS.map((lv) => (
          <TouchableOpacity
            key={lv}
            style={[s.seg, { backgroundColor: theme.surface }, form.antiCheatStrictness === lv && { backgroundColor: theme.primary }]}
            onPress={() => set("antiCheatStrictness", lv)}
          >
            <Text style={[s.segTxt, { color: form.antiCheatStrictness === lv ? "#FFF" : theme.textSecondary }]}>{lv}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  section: { borderRadius: 16, padding: 18, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#6366F1", borderWidth: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: typography.family.extraBold, textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" },
  cBox: { borderRadius: 12, padding: 12, alignItems: "center", gap: 6, borderWidth: 1.5 },
  cTitle: { fontSize: 12, fontFamily: typography.family.bold },
  customBox: { marginTop: 12, borderRadius: 12, padding: 12, borderWidth: 1 },
  customInput: { fontSize: 14, fontFamily: typography.family.bold, minHeight: 60 },
  label: { fontSize: 10, fontFamily: typography.family.bold, marginTop: 16, marginBottom: 8, textTransform: "uppercase" },
  row: { flexDirection: "row", gap: 8 },
  seg: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  segTxt: { fontSize: 12, fontFamily: typography.family.bold },
});
