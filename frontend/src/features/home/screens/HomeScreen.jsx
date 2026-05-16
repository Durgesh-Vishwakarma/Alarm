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

import { AlarmList, AlarmSectionHeader } from '../components/AlarmList';
import { FloatingAddButton } from '../components/FloatingAddButton';
import { GreetingPanel } from '../components/GreetingPanel';
import { NextAlarmBanner } from '../components/NextAlarmBanner';
import { initialAlarms } from '../data';
import { NewAlarmScreen } from '../../newAlarm/screens/NewAlarmScreen';
import { challenges, initialAlarmDraft, repeatPresets } from '../../newAlarm/data';
import { draftToPersistedAlarm, persistedAlarmToHomeAlarm } from '../../alarms/utils/alarmMapper';
import {
  deleteAlarm,
  loadAlarmState,
  reconcileActiveAlarmSchedules,
  saveAlarmDraft,
  setAlarmEnabled,
} from '../../alarms/services/alarmStore';
import { saveAlarms } from '../../alarms/services/alarmRepository';
import { calculateNextTriggerAt } from '../../alarms/utils/alarmTime';
import { refreshStaleActiveTriggers } from '../../alarms/utils/alarmSchedule';
import { theme } from '../../../shared/theme';


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
    const parsedTime = parseAlarmTime(alarm.time ?? initialAlarmDraft.time ?? '06:00');

    return {
      ...initialAlarmDraft,
      challengeId: alarm.challengeId,
      customChallengeDescription:
        alarm.customChallengeDescription ?? initialAlarmDraft.customChallengeDescription,
      customChallengeTitle: alarm.customChallengeTitle ?? initialAlarmDraft.customChallengeTitle,
      days: alarm.repeatDays,
      hour: Number.isFinite(alarm.hour) ? alarm.hour : parsedTime.hour,
      label: alarm.label,
      minute: Number.isFinite(alarm.minute) ? alarm.minute : parsedTime.minute,
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
const fallbackAlarmById = new Map(initialAlarms.map((alarm) => [alarm.id, alarm]));

function getDisplayTriggerAt(alarm, now) {
  if (alarm.nextTriggerAt && alarm.nextTriggerAt > now) {
    return alarm.nextTriggerAt;
  }

  return calculateNextTriggerAt({
    hour: alarm.hour,
    minute: alarm.minute,
    period: alarm.period,
    repeatDays: alarm.repeatDays,
  });
}

function formatRemaining(triggerAt, now) {
  const diff = Math.max(0, triggerAt - now);
  const totalSeconds = Math.ceil(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `in ${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `in ${minutes}m ${seconds}s`;
  }

  return seconds > 0 ? `in ${seconds}s` : 'ringing now';
}

function getChallengeVisual(alarm) {
  return (
    challenges.find((challenge) => challenge.id === alarm.challengeId) ??
    challenges.find((challenge) => challenge.title === alarm.challengeTitle) ??
    challenges[0]
  );
}

function getChallengeIdFromTitle(title) {
  return challenges.find((challenge) => challenge.title === title)?.id;
}

function normalizeLegacyAlarm(alarm) {
  const fallbackAlarm = fallbackAlarmById.get(alarm.id);

  if (!fallbackAlarm || fallbackAlarm.title === 'Scan Toothbrush') {
    return alarm;
  }

  const expectedChallengeId = getChallengeIdFromTitle(fallbackAlarm.title);
  const shouldRepair =
    alarm.challengeTitle === 'Scan Toothbrush' ||
    alarm.challengeId === 'custom-challenge' ||
    alarm.challengeId === 'scan-toothbrush';

  if (!expectedChallengeId || !shouldRepair) {
    return alarm;
  }

  return {
    ...alarm,
    challengeId: expectedChallengeId,
    challengeTitle: fallbackAlarm.title,
    customChallengeTitle: fallbackAlarm.title,
    label: alarm.label === 'Scan Toothbrush' ? fallbackAlarm.title : alarm.label,
  };
}

function normalizeLegacyAlarms(loadedAlarms) {
  return loadedAlarms.map(normalizeLegacyAlarm);
}

function getNextAlarm(alarms, now) {
  return alarms
    .filter((alarm) => alarm.isActive)
    .map((alarm) => ({ ...alarm, displayTriggerAt: getDisplayTriggerAt(alarm, now) }))
    .sort((first, second) => first.displayTriggerAt - second.displayTriggerAt)[0] ?? null;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [alarms, setAlarms] = useState(fallbackPersistedAlarms);
  const [editingAlarmId, setEditingAlarmId] = useState(null);
  const [newAlarmVisible, setNewAlarmVisible] = useState(false);
  const [newAlarmMounted, setNewAlarmMounted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const newAlarmTranslateX = useRef(new Animated.Value(width)).current;

  const homeAlarms = useMemo(() => alarms.map(persistedAlarmToHomeAlarm), [alarms]);
  const activeCount = useMemo(() => alarms.filter((alarm) => alarm.isActive).length, [alarms]);
  const nextAlarm = useMemo(() => getNextAlarm(alarms, now), [alarms, now]);
  const nextAlarmBanner = useMemo(() => {
    if (!nextAlarm) {
      return null;
    }

    const challenge = getChallengeVisual(nextAlarm);
    const schedule =
      nextAlarm.repeatDays.length === 0
        ? 'Ring once'
        : nextAlarm.repeatPreset === 'Daily'
        ? 'Daily  |  Growth Mode'
        : nextAlarm.repeatDays.join(' - ');

    return {
      ...nextAlarm,
      challengeTitle: nextAlarm.challengeTitle,
      detailText: schedule,
      icon: challenge.icon,
      iconColor: challenge.iconColor,
      period: nextAlarm.period,
      remaining: formatRemaining(nextAlarm.displayTriggerAt, now),
      schedule,
    };
  }, [nextAlarm, now]);
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
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

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
          const normalizedAlarms = refreshStaleActiveTriggers(
            normalizeLegacyAlarms(loadedAlarms),
            Date.now(),
            calculateNextTriggerAt,
          );
          setAlarms(normalizedAlarms);

          if (JSON.stringify(normalizedAlarms) !== JSON.stringify(loadedAlarms)) {
            saveAlarms(normalizedAlarms).catch(() => {});
          }

          reconcileActiveAlarmSchedules(normalizedAlarms).catch((error) => {
            console.warn('[alarm] reconcile.failed', { message: error.message });
          });
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
            alarm={nextAlarmBanner}
            onPress={() => {
              if (nextAlarmBanner) {
                openEditAlarm(nextAlarm);
              }
            }}
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
