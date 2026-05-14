import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import { GlassCard } from "../../components/GlassCard";
import { CustomSwitch } from "../../components/CustomSwitch";
import { tokens, typography } from "../../theme";
import { getChallengeById } from "../../data/challengeCatalog";

const { width } = Dimensions.get("window");
export const AlarmItem = ({ item, toggleAlarm, onLongPress, renderRightActions, theme }) => {
  const challenge = item.challengeId === "custom" 
    ? { icon: "sparkles", title: "Custom" } 
    : getChallengeById(item.challengeId);

  return (
    <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
      <Animated.View layout={Layout.springify().damping(20)} style={s.wrap}>
        <GlassCard 
          onLongPress={() => onLongPress(item)}
          style={[
            s.card, 
            !item.isActive && { opacity: 0.6 }
          ]}
          containerStyle={s.cardInner}
        >
          {/* Card Header: Icon & Switch */}
          <View style={s.header}>
            <View style={[s.iconBox, { backgroundColor: item.isActive ? tokens.colors.primary + "22" : "rgba(255,255,255,0.03)" }]}>
              <Ionicons 
                name={challenge?.icon || "alarm"} 
                size={18} 
                color={item.isActive ? tokens.colors.primary : theme.textMuted} 
              />
            </View>
            <CustomSwitch
              value={item.isActive}
              onValueChange={() => toggleAlarm(item.id)}
              activeColor={tokens.colors.primary}
            />
          </View>

          {/* Card Body: Time */}
          <View style={s.body}>
            <Text style={[s.time, { color: theme.textPrimary }]}>{item.time}</Text>
            <Text style={[s.period, { color: theme.textSecondary }]}>{item.period}</Text>
          </View>

          {/* Card Footer: Metadata */}
          <View style={s.footer}>
            <Text style={[s.days, { color: item.isActive ? tokens.colors.primary : theme.textMuted }]}>
              {item.repeatDays?.length === 7 ? "Daily" : item.repeatDays?.join(", ") || "Once"}
            </Text>
            <Text style={[s.label, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.label || "Alarm"}
            </Text>
          </View>
        </GlassCard>
      </Animated.View>
    </Swipeable>
  );
};

const s = StyleSheet.create({
  wrap: { 
    width: (width - tokens.spacing.xl * 2 - tokens.spacing.md) / 2,
    marginBottom: tokens.spacing.md,
  },
  card: { 
    borderRadius: tokens.radius.xl,
    minHeight: 160,
  },
  cardInner: {
    padding: tokens.spacing.lg,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  switch: {
    transform: [{ scale: 0.75 }],
  },
  body: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginVertical: tokens.spacing.md,
  },
  time: { 
    fontFamily: typography.family.extraBold,
    fontSize: 32,
    letterSpacing: -1,
  },
  period: { 
    ...typography.styles.caption,
    opacity: 0.8,
  },
  footer: {
    gap: 2,
  },
  days: { 
    ...typography.styles.caption,
    opacity: 0.58,
  },
  label: { 
    ...typography.styles.caption,
    opacity: 0.6,
  },
});

