import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RINGTONE_OPTIONS, getRingtoneLabel } from "../../../data/ringtones";
import { startAlarmSound, stopAlarmSound } from "../../../services/soundService";
import { typography, tokens } from "../../../theme";
import { CustomSwitch } from "../../CustomSwitch";

export const SystemSection = ({ form, set, theme }) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  const selectRingtone = async (value) => {
    await stopAlarmSound();
    set("ringtone", value);
    if (value !== "Silent") {
      await startAlarmSound(value, { forceRestart: true });
    }
  };

  return (
    <View style={s.container}>
      <Text style={[s.sectionLabel, { color: theme.textSecondary }]}>ALARM SYSTEM</Text>

      <TouchableOpacity
        style={[s.settingRow, { backgroundColor: theme.surface }]}
        activeOpacity={0.7}
        onPress={() => setExpanded((value) => !value)}
      >
        <View style={s.settingInfo}>
          <View style={[s.iconBox, { backgroundColor: `${theme.primary}18` }]}>
            <Ionicons name="musical-notes" size={18} color={theme.primary} />
          </View>
          <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Ringtone</Text>
        </View>
        <View style={s.settingRight}>
          <Text style={[s.settingVal, { color: theme.primary }]}>{getRingtoneLabel(form.ringtone)}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={theme.textMuted} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={[s.ringtoneList, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          {RINGTONE_OPTIONS.map((option) => {
            const active = form.ringtone === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={s.ringtoneOption}
                activeOpacity={0.75}
                onPress={() => selectRingtone(option.value)}
              >
                <Text style={[s.ringtoneText, { color: active ? theme.primary : theme.textPrimary }]}>{option.label}</Text>
                {active && <Ionicons name="checkmark" size={18} color={theme.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={[s.settingRow, { backgroundColor: theme.surface }]} activeOpacity={0.7}>
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
        <CustomSwitch value={form.vibrate} onValueChange={(val) => set("vibrate", val)} activeColor={theme.primary} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginTop: tokens.spacing.sm },
  sectionLabel: {
    fontFamily: typography.family.metadata,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xs,
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
  settingRight: { flexDirection: "row", alignItems: "center", gap: tokens.spacing.sm },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontFamily: typography.family.card, fontSize: 15 },
  settingVal: { fontFamily: typography.family.metadata, fontSize: 14 },
  ringtoneList: {
    borderWidth: 1,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.sm,
    overflow: "hidden",
  },
  ringtoneOption: {
    minHeight: 44,
    paddingHorizontal: tokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ringtoneText: {
    fontFamily: typography.family.metadata,
    fontSize: 14,
  },
});
