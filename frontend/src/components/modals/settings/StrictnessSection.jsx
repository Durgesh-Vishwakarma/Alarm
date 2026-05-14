import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography, tokens } from "../../../theme";

const LEVELS = [
  { id: "gentle", label: "Gentle", color: "#FFB547", desc: "Allows 3 snoozes." },
  { id: "balanced", label: "Balanced", color: "#FF7A18", desc: "Allows 1 snooze." },
  { id: "strict", label: "Strict", color: "#E85D00", desc: "No snooze allowed." },
];

export const StrictnessSection = ({ form, set, theme }) => (
  <View style={s.container}>
    <View style={s.headerRow}>
      <Text style={[s.label, { color: theme.textSecondary }]}>Wake intensity</Text>
      <Text style={[s.levelName, { color: theme.primary }]}>
        {LEVELS.find(l => l.id === form.strictness)?.label}
      </Text>
    </View>
    
    <View style={s.gaugeContainer}>
      {LEVELS.map((lvl, index) => {
        const isSelected = form.strictness === lvl.id;
        // Determine if this segment should be lit up (all segments up to current level)
        const currentIdx = LEVELS.findIndex(l => l.id === form.strictness);
        const isActive = index <= currentIdx;
        
        return (
          <TouchableOpacity
            key={lvl.id}
            onPress={() => set("strictness", lvl.id)}
            style={s.gaugeTouch}
          >
            <View 
              style={[
                s.gaugeSegment,
                { backgroundColor: isActive ? lvl.color : "rgba(255,255,255,0.05)" },
                isSelected && { shadowColor: lvl.color, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 }
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
    
    <View style={[s.descBox, { backgroundColor: "rgba(255,255,255,0.02)" }]}>
      <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
      <Text style={[s.descText, { color: theme.textSecondary }]}>
        {LEVELS.find(l => l.id === form.strictness)?.desc}
      </Text>
    </View>
  </View>
);

const s = StyleSheet.create({
  container: { marginTop: tokens.spacing.md },
  headerRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: 4,
  },
  label: { 
    ...typography.styles.caption,
    opacity: 0.58,
  },
  levelName: {
    ...typography.styles.caption,
  },
  gaugeContainer: { 
    flexDirection: "row", 
    gap: 8,
    marginBottom: tokens.spacing.xl,
  },
  gaugeTouch: {
    flex: 1,
  },
  gaugeSegment: { 
    height: 12, 
    borderRadius: 6, 
  },
  descBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  descText: {
    ...typography.styles.caption,
    opacity: 0.8,
  },
});
