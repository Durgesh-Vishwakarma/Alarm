import { Ionicons } from "@expo/vector-icons";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { haptics } from "../services/hapticService";
import {
  INITIAL_ALARM_DRAFT,
  alarmDraftAtom,
  alarmEditingIdAtom,
  alarmModalVisibleAtom,
  alarmsAtom,
} from "../atoms/alarmAtoms";
import AlarmSettingsModal from "../components/modals/AlarmSettingsModal";
import { getNextAlarmDate } from "../services/alarmRuntime";
import { loadAlarms } from "../services/alarmStorage";
import { loadWakeStats } from "../services/streakService";
import { handleToggleAlarm, handleDeleteAlarmAction } from "../services/alarmActions";
import { useTheme } from "../theme/ThemeContext";
import { tokens } from "../theme/tokens";

import { Dashboard } from "./HomeScreen/Dashboard";
import { AlarmItem } from "./HomeScreen/AlarmItem";

export const HomeScreen = () => {
  const { theme } = useTheme();
  const [alarms, setAlarms] = useAtom(alarmsAtom);
  const setDraft = useSetAtom(alarmDraftAtom);
  const setEditingId = useSetAtom(alarmEditingIdAtom);
  const setModalVisible = useSetAtom(alarmModalVisibleAtom);
  const [wakeStats, setWakeStats] = useState(null);
  const [tick, setTick] = useState(Date.now());

  const hydrate = useCallback(async () => {
    const [storedAlarms, storedStats] = await Promise.all([loadAlarms(), loadWakeStats()]);
    setAlarms(storedAlarms);
    setWakeStats(storedStats);
  }, [setAlarms]);

  useEffect(() => { 
    hydrate(); 
    const interval = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [hydrate]);

  const openNewAlarm = useCallback(() => {
    setDraft({ ...INITIAL_ALARM_DRAFT });
    setEditingId(null);
    setModalVisible(true);
  }, [setDraft, setEditingId, setModalVisible]);

  const openEditAlarm = useCallback(
    (a) => {
      setDraft({ ...INITIAL_ALARM_DRAFT, ...a });
      setEditingId(a.id);
      setModalVisible(true);
    },
    [setDraft, setEditingId, setModalVisible],
  );

  const activeAlarms = useMemo(() => alarms.filter(a => a.isActive), [alarms]);
  const nextAlarm = useMemo(() => {
    return activeAlarms
      .map(a => ({ ...a, mins: Math.round((getNextAlarmDate(a).getTime() - tick) / 60000) }))
      .sort((a, b) => a.mins - b.mins)[0];
  }, [activeAlarms, tick]);

  const completionRate = wakeStats?.attempted ? Math.round((wakeStats.completed / wakeStats.attempted) * 100) : 0;
  const recommendations = useMemo(() => {
    if (!nextAlarm) return "Set an AI alarm to start your streak.";
    return "Your wake rhythm is strong. Keep it up!";
  }, [nextAlarm]);

  const renderRightActions = (alarm) => (
    <View style={s.swipeRow}>
      <RectButton style={[s.swipeBtn, { backgroundColor: theme.danger }]} onPress={() => handleDeleteAlarmAction(alarms, alarm.id, setAlarms)}>
        <Ionicons name="trash-outline" size={20} color="#FFF" />
      </RectButton>
    </View>
  );

  const fabScale = useSharedValue(1);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFabIn = () => {
    fabScale.value = withSpring(0.9, { damping: 12, stiffness: 200 });
    haptics.impact("light");
  };

  const handleFabOut = () => {
    fabScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <FlatList
          data={alarms}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={s.columnWrapper}
          ListHeaderComponent={() => (
            <Dashboard 
              nextAlarm={nextAlarm} 
              wakeStats={wakeStats} 
              completionRate={completionRate} 
              recommendations={recommendations} 
              theme={theme} 
              toggleAlarm={(id) => handleToggleAlarm(alarms, id, setAlarms)}
            />
          )}
          renderItem={({ item }) => (
            <AlarmItem 
              item={item} 
              theme={theme} 
              toggleAlarm={(id) => handleToggleAlarm(alarms, id, setAlarms)} 
              onLongPress={openEditAlarm}
              renderRightActions={renderRightActions}
            />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />

        <Animated.View style={[s.fabContainer, fabAnimatedStyle]}>
          <TouchableOpacity 
            activeOpacity={1}
            onPressIn={handleFabIn}
            onPressOut={handleFabOut}
            style={[s.fab, { backgroundColor: theme.primary }]} 
            onPress={openNewAlarm}
          >
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      <AlarmSettingsModal />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  list: { 
    padding: tokens.spacing.xl, 
    paddingBottom: 140, 
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  fabContainer: {
    position: "absolute",
    bottom: 92,
    right: tokens.spacing.xl,
  },
  fab: { 
    width: 58, 
    height: 58, 
    borderRadius: tokens.radius.full, 
    alignItems: "center", 
    justifyContent: "center", 
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  swipeRow: { width: 80, justifyContent: "center" },
  swipeBtn: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: tokens.radius.lg, marginVertical: tokens.spacing.xs, marginRight: tokens.spacing.md },
});

