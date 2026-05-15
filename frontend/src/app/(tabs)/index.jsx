import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';

import { AlarmList, AlarmSectionHeader } from '../../features/home/components/AlarmList';
import { FloatingAddButton } from '../../features/home/components/FloatingAddButton';
import { GreetingPanel } from '../../features/home/components/GreetingPanel';
import { HomeHeader } from '../../features/home/components/HomeHeader';
import { ShortcutGrid } from '../../features/home/components/ShortcutGrid';
import { StreakBanner } from '../../features/home/components/StreakBanner';
import { initialAlarms, shortcuts } from '../../features/home/data';
import { theme } from '../../theme';

export default function HomeScreen() {
  const [alarms, setAlarms] = useState(initialAlarms);

  const activeCount = useMemo(() => alarms.filter((alarm) => alarm.active).length, [alarms]);

  const handleToggleAlarm = (alarmId) => {
    setAlarms((currentAlarms) =>
      currentAlarms.map((alarm) =>
        alarm.id === alarmId ? { ...alarm, active: !alarm.active } : alarm,
      ),
    );
  };

  const showAction = (title, message) => {
    Alert.alert(title, message);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <HomeHeader />
          <StreakBanner />
          <GreetingPanel
            onProfilePress={() => showAction('Profile', 'Profile action is ready.')}
          />
          <ShortcutGrid
            items={shortcuts}
            onShortcutPress={(item) => showAction(item.label, `${item.label} action is ready.`)}
          />
          <AlarmSectionHeader
            activeCount={activeCount}
            totalCount={alarms.length}
            onAddPress={() => showAction('Add Alarm', 'Add alarm action is ready.')}
          />
          <AlarmList
            alarms={alarms}
            onOpenAlarm={(alarm) => showAction(alarm.time, `${alarm.title} settings are ready.`)}
            onToggleAlarm={handleToggleAlarm}
          />
        </ScrollView>

        <FloatingAddButton onPress={() => showAction('Add Alarm', 'Create alarm action is ready.')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 114,
    paddingHorizontal: 22,
    paddingTop: theme.space.md,
  },
});
