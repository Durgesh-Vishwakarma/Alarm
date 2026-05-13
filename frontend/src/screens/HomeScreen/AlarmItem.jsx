import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import { Card } from "../../components/Card";
import { typography } from "../../theme";
import { getChallengeById } from "../../data/challengeCatalog";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const AlarmItem = ({ item, toggleAlarm, onLongPress, renderRightActions, theme }) => {
  const challenge = item.challengeId === "custom" 
    ? { icon: "sparkles", title: "Custom" } 
    : getChallengeById(item.challengeId);

  return (
    <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
      <Animated.View layout={Layout.springify().damping(18)} style={s.wrap}>
        <Card
          variant={item.isActive ? "active" : "default"}
          onLongPress={() => onLongPress(item)}
          style={[s.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, !item.isActive && { opacity: 0.6 }]}
        >
          <View style={s.row}>
            <View style={s.timeCol}>
              <View style={s.timeRow}>
                <Text style={[s.time, { color: theme.textPrimary }]}>{item.time}</Text>
                <Text style={[s.period, { color: theme.primary }]}>{item.period}</Text>
              </View>
              <Text style={[s.label, { color: theme.textSecondary }]}>{item.label || "Alarm"}</Text>
            </View>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleAlarm(item.id)}
              trackColor={{ true: theme.primary }}
            />
          </View>

          <View style={[s.footer, { borderTopColor: theme.cardBorder }]}>
            <View style={s.challenge}>
              <Ionicons name={challenge.icon} size={14} color={theme.textMuted} />
              <Text style={[s.challengeTxt, { color: theme.textMuted }]}>{item.task}</Text>
            </View>
            <Text style={[s.days, { color: theme.textMuted }]}>
              {item.repeatDays?.length === 7 ? "Every day" : item.repeatDays?.join(", ")}
            </Text>
          </View>
        </Card>
      </Animated.View>
    </Swipeable>
  );
};

const s = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: { padding: 16, borderLeftWidth: 4, borderLeftColor: "#DDD" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timeCol: { gap: 2 },
  timeRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  time: { fontFamily: typography.family.extraBold, fontSize: 32 },
  period: { fontFamily: typography.family.bold, fontSize: 14, marginBottom: 4 },
  label: { fontFamily: typography.family.bold, fontSize: 13 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  challenge: { flexDirection: "row", alignItems: "center", gap: 6 },
  challengeTxt: { fontFamily: typography.family.medium, fontSize: 12 },
  days: { fontFamily: typography.family.bold, fontSize: 11 },
});
