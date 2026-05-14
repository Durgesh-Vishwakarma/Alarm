import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography, tokens } from "../../../theme";
import { AI_CHALLENGES } from "../../../data/challengeCatalog";

export const ChallengeSection = ({ form, set, theme }) => (
  <View style={s.container}>
    <Text style={[s.label, { color: theme.textSecondary }]}>CHOOSE CHALLENGE</Text>

    <View style={s.grid}>
      {AI_CHALLENGES.map((item) => {
        const isSelected = form.challengeId === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              s.card,
              { backgroundColor: isSelected ? `${theme.primary}18` : theme.surface },
              isSelected && { borderColor: theme.primary, borderWidth: 2 },
            ]}
            onPress={() => set("challengeId", item.id)}
          >
            <View
              style={[
                s.iconBox,
                { backgroundColor: isSelected ? `${theme.primary}28` : `${theme.cardBorder}40` },
              ]}
            >
              <Ionicons name={item.icon} size={22} color={isSelected ? theme.primary : theme.textSecondary} />
            </View>
            <View style={s.cardText}>
              <Text style={[s.cardTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[s.difficulty, { color: theme.textMuted }]}>{item.difficulty}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>

    {form.challengeId === "custom" ? (
      <View style={[s.customBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
        <Text style={[s.customLabel, { color: theme.textSecondary }]}>Describe your challenge</Text>
        <TextInput
          style={[s.input, { color: theme.textPrimary, borderColor: theme.cardBorder }]}
          placeholder="e.g. Photo of your running shoes"
          placeholderTextColor={theme.textMuted}
          value={form.customChallengeTitle || ""}
          onChangeText={(t) => set("customChallengeTitle", t)}
        />
        <Text style={[s.customHint, { color: theme.textMuted }]}>
          Optional keywords for AI (comma-separated)
        </Text>
        <TextInput
          style={[s.input, { color: theme.textPrimary, borderColor: theme.cardBorder }]}
          placeholder="shoes, sneakers, floor"
          placeholderTextColor={theme.textMuted}
          value={form.customChallengeHints || ""}
          onChangeText={(t) => set("customChallengeHints", t)}
        />
      </View>
    ) : null}
  </View>
);

const s = StyleSheet.create({
  container: { marginTop: tokens.spacing.md },
  label: {
    fontFamily: typography.family.metadata,
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.md,
  },
  card: {
    width: "47%",
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: typography.family.card,
    fontSize: 13,
    marginBottom: 2,
  },
  difficulty: {
    fontFamily: typography.family.metadata,
    fontSize: 10,
    textTransform: "uppercase",
  },
  customBox: {
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    gap: tokens.spacing.sm,
  },
  customLabel: {
    fontFamily: typography.family.metadata,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  customHint: {
    fontFamily: typography.family.metadata,
    fontSize: 11,
    marginTop: tokens.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    fontFamily: typography.family.metadata,
    fontSize: 15,
  },
});
