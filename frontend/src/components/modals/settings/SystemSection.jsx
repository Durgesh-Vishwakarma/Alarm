import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography, tokens } from "../../../theme";
import { CustomSwitch } from "../../CustomSwitch";

export const SystemSection = ({ form, set, theme }) => (
  <View style={s.container}>
    <Text style={[s.sectionLabel, { color: theme.textSecondary }]}>ALARM SYSTEM</Text>
    
    <TouchableOpacity 
      style={[s.settingRow, { backgroundColor: theme.surface }]}
      activeOpacity={0.7}
    >
      <View style={s.settingInfo}>
        <View style={[s.iconBox, { backgroundColor: `${theme.primary}18` }]}>
          <Ionicons name="musical-notes" size={18} color={theme.primary} />
        </View>
        <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Ringtone</Text>
      </View>
      <Text style={[s.settingVal, { color: theme.primary }]}>{form.ringtone}</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={[s.settingRow, { backgroundColor: theme.surface }]}
      activeOpacity={0.7}
    >
      <View style={s.settingInfo}>
        <View style={[s.iconBox, { backgroundColor: `${tokens.colors.accent}18` }]}>
          <Ionicons name="notifications" size={18} color={tokens.colors.accent} />
        </View>
        <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Snooze Limit</Text>
      </View>
      <Text style={[s.settingVal, { color: theme.textSecondary }]}>{form.snoozeLimit}x</Text>
    </TouchableOpacity>

    <View style={[s.settingRow, { backgroundColor: theme.surface }]}>
      <View style={s.settingInfo}>
        <View style={[s.iconBox, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
          <Ionicons name="pulse" size={18} color={theme.textMuted} />
        </View>
        <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Vibration</Text>
      </View>
      <CustomSwitch 
        value={form.vibrate}
        onValueChange={(val) => set("vibrate", val)}
        activeColor={theme.primary}
      />
    </View>
  </View>
);

const s = StyleSheet.create({
  container: { marginTop: tokens.spacing.sm },
  sectionLabel: { 
    fontFamily: typography.family.metadata, 
    fontSize: 12, 
    letterSpacing: 1.5, 
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: 4,
  },
  settingRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: tokens.spacing.md, 
    borderRadius: tokens.radius.lg, 
    marginBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  settingInfo: { flexDirection: "row", alignItems: "center", gap: tokens.spacing.md },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontFamily: typography.family.card, fontSize: 15 },
  settingVal: { fontFamily: typography.family.metadata, fontSize: 14 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
});
