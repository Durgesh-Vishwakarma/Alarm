import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AlarmList, AlarmSectionHeader } from '../../features/home/components/AlarmList';
import { FloatingAddButton } from '../../features/home/components/FloatingAddButton';
import { GreetingPanel } from '../../features/home/components/GreetingPanel';
import { NextAlarmBanner } from '../../features/home/components/NextAlarmBanner';
import { initialAlarms } from '../../features/home/data';
import { NewAlarmScreen } from '../../features/newAlarm/NewAlarmScreen';
import { challenges, initialAlarmDraft, repeatPresets } from '../../features/newAlarm/data';
import { draftToPersistedAlarm, persistedAlarmToHomeAlarm } from '../../features/alarms/alarmMapper';
import {
  deleteAlarm,
  loadAlarmState,
  saveAlarmDraft,
  setAlarmEnabled,
} from '../../features/alarms/alarmStore';
import { theme } from '../../theme';


function parseAlarmTime(time) {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

function resolveRepeat(schedule) {
  if (schedule.includes('Daily')) {
    return { days: repeatPresets.Daily, repeatPreset: 'Daily' };
  }

  if (schedule.includes('Sat') && schedule.includes('Sun') && !schedule.includes('Mon')) {
    return { days: repeatPresets.Weekend, repeatPreset: 'Weekend' };
  }

  return { days: repeatPresets.Weekdays, repeatPreset: 'Weekdays' };
}

function challengeIdFromTitle(title) {
  return challenges.find((challenge) => challenge.title === title)?.id ?? 'custom-challenge';
}

function alarmToDraft(alarm) {
  if ('isActive' in alarm) {
    return {
      ...initialAlarmDraft,
      challengeId: alarm.challengeId,
      customChallengeDescription:
        alarm.customChallengeDescription ?? initialAlarmDraft.customChallengeDescription,
      customChallengeTitle: alarm.customChallengeTitle ?? initialAlarmDraft.customChallengeTitle,
      days: alarm.repeatDays,
      hour: alarm.hour,
      label: alarm.label,
      minute: alarm.minute,
      notification: alarm.isActive,
      period: alarm.period,
      repeatPreset: alarm.repeatPreset,
      smartWake: alarm.smartWakeEnabled,
      snooze: alarm.snoozeMinutes,
      sound: alarm.sound ?? initialAlarmDraft.sound,
      vibration: alarm.vibrationEnabled,
    };
  }

  const { hour, minute } = parseAlarmTime(alarm.time);
  const repeat = resolveRepeat(alarm.schedule);
  const challengeId = challengeIdFromTitle(alarm.title);

  return {
    ...initialAlarmDraft,
    ...repeat,
    challengeId,
    customChallengeTitle:
      challengeId === 'custom-challenge' ? alarm.title : initialAlarmDraft.customChallengeTitle,
    hour,
    label: alarm.label ?? alarm.title,
    minute,
    notification: alarm.active,
    period: alarm.meridiem,
  };
}

const fallbackPersistedAlarms = initialAlarms.map((alarm) =>
  draftToPersistedAlarm(alarmToDraft(alarm), { id: alarm.id }),
);

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [alarms, setAlarms] = useState(fallbackPersistedAlarms);
  const [editingAlarmId, setEditingAlarmId] = useState(null);
  const [newAlarmVisible, setNewAlarmVisible] = useState(false);
  const [newAlarmMounted, setNewAlarmMounted] = useState(false);
  const newAlarmTranslateX = useRef(new Animated.Value(width)).current;

  const homeAlarms = useMemo(() => alarms.map(persistedAlarmToHomeAlarm), [alarms]);
  const activeCount = useMemo(() => alarms.filter((alarm) => alarm.isActive).length, [alarms]);
  const editorInitialDraft = useMemo(() => {
    const editingAlarm = alarms.find((alarm) => alarm.id === editingAlarmId);
    return editingAlarm ? alarmToDraft(editingAlarm) : initialAlarmDraft;
  }, [alarms, editingAlarmId]);

  const handleToggleAlarm = async (alarmId) => {
    const alarm = alarms.find((item) => item.id === alarmId);
    if (!alarm) return;

    const previousAlarms = alarms;
    const nextEnabled = !alarm.isActive;
    const optimisticAlarms = alarms.map((item) =>
      item.id === alarmId ? { ...item, isActive: nextEnabled } : item,
    );

    setAlarms(optimisticAlarms);

    try {
      setAlarms(await setAlarmEnabled(previousAlarms, alarmId, nextEnabled));
    } catch (error) {
      setAlarms(previousAlarms);
      Alert.alert('Alarm update failed', error.message);
    }
  };

  const handleDeleteAlarm = async (alarmId) => {
    const previousAlarms = alarms;
    setAlarms((currentAlarms) => currentAlarms.filter((alarm) => alarm.id !== alarmId));

    try {
      setAlarms(await deleteAlarm(previousAlarms, alarmId));
    } catch (error) {
      setAlarms(previousAlarms);
      Alert.alert('Alarm delete failed', error.message);
    }
  };

  const showAction = (title, message) => {
    Alert.alert(title, message);
  };

  const openNewAlarm = () => {
    setEditingAlarmId(null);
    setNewAlarmMounted(true);
    setNewAlarmVisible(true);
  };

  const openEditAlarm = (alarm) => {
    setEditingAlarmId(alarm.id);
    setNewAlarmMounted(true);
    setNewAlarmVisible(true);
  };

  const closeNewAlarm = () => {
    setNewAlarmVisible(false);
  };

  const saveEditorDraft = async (savedDraft) => {
    const previousAlarms = alarms;

    try {
      const nextAlarms = await saveAlarmDraft(previousAlarms, savedDraft, editingAlarmId);
      setAlarms(nextAlarms);
      closeNewAlarm();
    } catch (error) {
      if (error.nextAlarms) {
        setAlarms(error.nextAlarms);
        closeNewAlarm();
      }
      Alert.alert('Alarm save failed', error.message);
    }
  };

  useEffect(() => {
    const warmTimer = setTimeout(() => {
      setNewAlarmMounted(true);
    }, 350);

    return () => clearTimeout(warmTimer);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadAlarmState(fallbackPersistedAlarms)
      .then((loadedAlarms) => {
        if (mounted) {
          setAlarms(loadedAlarms);
        }
      })
      .catch((error) => {
        Alert.alert('Could not load alarms', error.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!newAlarmVisible) {
      newAlarmTranslateX.setValue(width);
    }
  }, [newAlarmTranslateX, newAlarmVisible, width]);

  useEffect(() => {
    if (!newAlarmMounted) {
      return undefined;
    }

    Animated.timing(newAlarmTranslateX, {
      duration: newAlarmVisible ? 170 : 130,
      easing: newAlarmVisible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      toValue: newAlarmVisible ? 0 : width,
      useNativeDriver: true,
    }).start();

    return undefined;
  }, [newAlarmMounted, newAlarmTranslateX, newAlarmVisible, width]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
         
          <GreetingPanel
            onProfilePress={() => showAction('Profile', 'Profile action is ready.')}
          />
          <NextAlarmBanner
          time="06:00 AM"
          remaining="in 7h 12m"
          challenge="Scan Toothbrush"
          />
          
          <AlarmSectionHeader
            activeCount={activeCount}
            totalCount={homeAlarms.length}
            onAddPress={openNewAlarm}
          />
          <AlarmList
            alarms={homeAlarms}
            onDeleteAlarm={handleDeleteAlarm}
            onOpenAlarm={(alarm) => {
              const persistedAlarm = alarms.find((item) => item.id === alarm.id);
              if (persistedAlarm) {
                openEditAlarm(persistedAlarm);
              }
            }}
            onToggleAlarm={handleToggleAlarm}
          />
        </ScrollView>

        <FloatingAddButton onPress={openNewAlarm} />

        {newAlarmMounted ? (
          <Animated.View
            pointerEvents={newAlarmVisible ? 'auto' : 'none'}
            style={[
              styles.newAlarmOverlay,
              {
                transform: [{ translateX: newAlarmTranslateX }],
              },
            ]}
          >
            <NewAlarmScreen
              initialDraft={editorInitialDraft}
              mode={editingAlarmId ? 'edit' : 'create'}
              onClose={closeNewAlarm}
              onSaved={saveEditorDraft}
            />
          </Animated.View>
        ) : null}
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
  newAlarmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    elevation: 20,
    zIndex: 20,
  },
});
