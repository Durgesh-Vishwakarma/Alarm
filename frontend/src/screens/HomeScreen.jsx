import { Ionicons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { alarmsAtom } from "../atoms/alarmAtoms";
import Header from "../components/Header";
import AlarmSettingsModal from "../components/modals/AlarmSettingsModal";
import { getNextAlarmDate } from "../services/alarmRuntime";
import { loadAlarms } from "../services/alarmStorage";
import { loadWakeStats } from "../services/streakService";
import { handleToggleAlarm, handleSaveAlarmAction, handleDeleteAlarmAction } from "../services/alarmActions";
import { useTheme } from "../theme/ThemeContext";

import { Dashboard } from "./HomeScreen/Dashboard";
import { AlarmItem } from "./HomeScreen/AlarmItem";

export const HomeScreen = () => {
  const { theme } = useTheme();
  const [alarms, setAlarms] = useAtom(alarmsAtom);
  const [wakeStats, setWakeStats] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);

  const hydrate = useCallback(async () => {
    const [storedAlarms, storedStats] = await Promise.all([loadAlarms(), loadWakeStats()]);
    setAlarms(storedAlarms);
    setWakeStats(storedStats);
  }, [setAlarms]);

  useEffect(() => { hydrate(); }, [hydrate]);

  const activeAlarms = useMemo(() => alarms.filter(a => a.isActive), [alarms]);
  const nextAlarm = useMemo(() => {
    return activeAlarms
      .map(a => ({ ...a, mins: Math.round((getNextAlarmDate(a).getTime() - Date.now()) / 60000) }))
      .sort((a, b) => a.mins - b.mins)[0];
  }, [activeAlarms]);

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

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <Header name="Durgesh" />
        
        <FlatList
          data={alarms}
          keyExtractor={item => item.id}
          ListHeaderComponent={() => (
            <Dashboard 
              nextAlarm={nextAlarm} 
              wakeStats={wakeStats} 
              completionRate={completionRate} 
              recommendations={recommendations} 
              theme={theme} 
            />
          )}
          renderItem={({ item }) => (
            <AlarmItem 
              item={item} 
              theme={theme} 
              toggleAlarm={(id) => handleToggleAlarm(alarms, id, setAlarms)} 
              onLongPress={(a) => { setEditingAlarm(a); setModalVisible(true); }}
              renderRightActions={renderRightActions}
            />
          )}
          contentContainerStyle={s.list}
        />

        <TouchableOpacity style={[s.fab, { backgroundColor: theme.primary }]} onPress={() => { setEditingAlarm(null); setModalVisible(true); }}>
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>

      <AlarmSettingsModal 
        visible={isModalVisible} 
        editingAlarm={editingAlarm} 
        onClose={() => setModalVisible(false)} 
        onSave={(p) => { handleSaveAlarmAction(alarms, p, setAlarms); setModalVisible(false); }} 
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  list: { padding: 16, paddingBottom: 100 },
  fab: { position: "absolute", bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", elevation: 4 },
  swipeRow: { width: 80, justifyContent: "center" },
  swipeBtn: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 12, marginVertical: 4, marginRight: 12 },
});
