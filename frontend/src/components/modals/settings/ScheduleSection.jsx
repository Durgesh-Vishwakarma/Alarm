import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { typography, tokens } from "../../../theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const ScheduleSection = ({ form, set, theme }) => {
  const toggleDay = (day) => {
    const days = form.repeatDays.includes(day)
      ? form.repeatDays.filter((d) => d !== day)
      : [...form.repeatDays, day];
    set("repeatDays", days);
  };

  return (
    <View style={s.container}>
      <Text style={[s.label, { color: theme.textSecondary }]}>Repeat schedule</Text>
      <View style={s.daysRow}>
        {DAYS.map((day) => {
          const isSelected = form.repeatDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[
                s.dayCircle,
                { backgroundColor: isSelected ? tokens.colors.primary : theme.surface }
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[s.dayTxt, { color: isSelected ? "#FFF" : theme.textMuted }]}>
                {day[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginTop: tokens.spacing.sm },
  label: { 
    ...typography.styles.caption,
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: 4,
    opacity: 0.58,
  },
  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: "center", 
    justifyContent: "center",
  },
  dayTxt: { 
    fontFamily: typography.family.semiBold,
    fontSize: 15,
  },
});
