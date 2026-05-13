import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WheelTimePicker from "../../WheelPicker";
import { typography } from "../../../theme";

export const TimeSection = ({ form, set, theme }) => (
  <View style={[s.timeCard, { backgroundColor: theme.heroCard }]}>
    <Text style={s.timeLabel}>SET TIME</Text>
    <View style={s.timePickerWrap}>
      <WheelTimePicker
        hour={form.hour}
        minute={form.minute}
        period={form.period}
        onChangeHour={(v) => set("hour", v)}
        onChangeMinute={(v) => set("minute", v)}
        onChangePeriod={(v) => set("period", v)}
      />
    </View>
    <View style={s.timePreview}>
      <Ionicons name="alarm-outline" size={16} color={theme.primary} />
      <Text style={[s.timePreviewTxt, { color: theme.heroNeon }]}>
        {form.hour}:{form.minute} {form.period}
      </Text>
    </View>
  </View>
);

const s = StyleSheet.create({
  timeCard: { borderRadius: 18, padding: 20, marginBottom: 14 },
  timePickerWrap: { position: "relative", overflow: "hidden", borderRadius: 14 },
  timeLabel: {
    textAlign: "center",
    fontFamily: typography.family.bold,
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    marginBottom: 12,
  },
  timePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
  },
  timePreviewTxt: { fontFamily: typography.family.extraBold, fontSize: 15 },
});
