import { View, StyleSheet } from "react-native";
import WheelTimePicker from "../../WheelPicker";

export const TimeSection = ({ form, setMultiple }) => (
  <View style={s.container}>
    <WheelTimePicker
      hour={form.hour}
      minute={form.minute}
      period={form.period}
      onTimeChange={(h, m, p) => {
        setMultiple({ hour: h, minute: m, period: p });
      }}
    />
  </View>
);

const s = StyleSheet.create({
  container: {
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    paddingVertical: 8,
  },
});
