import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  Layout,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "../../components/GlassCard";
import { CustomSwitch } from "../../components/CustomSwitch";
import { tokens, typography } from "../../theme";
import { getChallengeById } from "../../data/challengeCatalog";
import { haptics } from "../../services/hapticService";

const { width } = Dimensions.get("window");

export const AlarmItem = ({
  item,
  index = 0,
  toggleAlarm,
  onLongPress,
  renderRightActions,
  theme,
}) => {
  const active = item.isActive;
  const scale = useSharedValue(1);

  const challenge =
    item.challengeId === "custom"
      ? { icon: "sparkles", title: "Custom" }
      : getChallengeById(item.challengeId);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const repeatLabel =
    item.repeatDays?.length === 7
      ? "Daily"
      : item.repeatDays?.length
      ? item.repeatDays.join(" • ")
      : "Once";

  const handleToggle = () => {
    haptics.selection();
    toggleAlarm(item.id);
  };

  const handleLongPress = () => {
    haptics.impact("medium");
    onLongPress(item);
  };

  return (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      overshootRight={false}
    >
      <Animated.View
        entering={FadeInDown.delay(index * 60).duration(360)}
        layout={Layout.springify().damping(20)}
        style={[s.wrap, animatedStyle]}
      >
        <Pressable
          onPressIn={() => {
            scale.value = withSpring(0.97, tokens.animation.spring);
          }}
          onPressOut={() => {
            scale.value = withSpring(1, tokens.animation.spring);
          }}
          onLongPress={handleLongPress}
        >
          <GlassCard
            style={[
              s.card,
              {
                borderColor: active
                  ? `${tokens.colors.primary}44`
                  : "rgba(255,255,255,0.16)",
              },
            ]}
            containerStyle={s.cardInner}
          >
            <LinearGradient
              colors={[
                active ? `${tokens.colors.primary}26` : "rgba(255,255,255,0.06)",
                "rgba(255,255,255,0.02)",
              ]}
              style={s.cardGlow}
            />

            <View style={s.header}>
              <View
                style={[
                  s.iconBox,
                  {
                    backgroundColor: active
                      ? `${tokens.colors.primary}22`
                      : "rgba(255,255,255,0.08)",
                  },
                ]}
              >
                <Ionicons
                  name={challenge?.icon || "alarm"}
                  size={18}
                  color={active ? tokens.colors.primary : theme.textSecondary}
                />
              </View>

              <View style={s.switchWrap}>
                <Text
                  style={[
                    s.switchLabel,
                    {
                      color: active ? tokens.colors.primary : theme.textSecondary,
                    },
                  ]}
                >
                  {active ? "ON" : "OFF"}
                </Text>

                <CustomSwitch
                  value={active}
                  onValueChange={handleToggle}
                  activeColor={tokens.colors.primary}
                  inactiveColor="rgba(255,255,255,0.28)"
                  thumbOffColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={s.body}>
              <View style={s.timeRow}>
                <Text style={[s.time, { color: theme.textPrimary }]}>
                  {item.time}
                </Text>

                <Text style={[s.period, { color: theme.textSecondary }]}>
                  {item.period}
                </Text>
              </View>

              <Text
                style={[s.challenge, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {challenge?.title || "Wake Challenge"}
              </Text>
            </View>

            <View style={s.footer}>
              <View
                style={[
                  s.daysPill,
                  {
                    backgroundColor: active
                      ? `${tokens.colors.primary}14`
                      : "rgba(255,255,255,0.07)",
                  },
                ]}
              >
                <Ionicons
                  name="repeat"
                  size={11}
                  color={active ? tokens.colors.primary : theme.textSecondary}
                />

                <Text
                  style={[
                    s.days,
                    {
                      color: active ? tokens.colors.primary : theme.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {repeatLabel}
                </Text>
              </View>

              <Text
                style={[s.label, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {item.label || "Alarm"}
              </Text>
            </View>
          </GlassCard>
        </Pressable>
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
    overflow: "hidden",
    borderRadius: 28,
    minHeight: 178,
    borderWidth: 1,
  },

  cardInner: {
    flex: 1,
    padding: tokens.spacing.lg,
    justifyContent: "space-between",
  },

  cardGlow: {
    ...StyleSheet.absoluteFillObject,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  switchWrap: {
    alignItems: "flex-end",
    gap: 5,
  },

  switchLabel: {
    ...typography.styles.caption,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  body: {
    marginVertical: tokens.spacing.md,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },

  time: {
    fontFamily: typography.family.extraBold,
    fontSize: 34,
    letterSpacing: -1.4,
  },

  period: {
    ...typography.styles.caption,
    opacity: 0.78,
  },

  challenge: {
    ...typography.styles.caption,
    marginTop: 4,
    opacity: 0.68,
  },

  footer: {
    gap: tokens.spacing.xs,
  },

  daysPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: tokens.radius.full,
  },

  days: {
    ...typography.styles.caption,
    fontWeight: "700",
    maxWidth: 95,
  },

  label: {
    ...typography.styles.caption,
    opacity: 0.62,
  },
});