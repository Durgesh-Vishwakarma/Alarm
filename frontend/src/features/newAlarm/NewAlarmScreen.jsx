import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { theme } from '../../theme';
import { ChallengeStep } from './components/ChallengeStep';
import { NewAlarmHeader } from './components/NewAlarmHeader';
import { RepeatAlarmSettings } from './components/RepeatAlarmSettings';
import { RingtonePicker } from './components/RingtonePicker';
import { TimeStep } from './components/TimeStep';
import { initialAlarmDraft } from './data';
import { stopRingtonePreview } from './ringtonePreview';
import { formatTime, getSelectedChallenge } from './utils';

export function NewAlarmScreen({
  initialDraft = initialAlarmDraft,
  mode = 'create',
  onClose,
  onSaved,
} = {}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [screenScrollEnabled, setScreenScrollEnabled] = useState(true);
  const headerTitle = mode === 'edit' ? 'Edit Alarm' : 'New Alarm';

  useEffect(() => {
    setDraft(initialDraft);
    setScreenScrollEnabled(true);
    stopRingtonePreview();
  }, [initialDraft]);

  useEffect(() => {
    return () => {
      stopRingtonePreview();
    };
  }, []);

  const selectedChallenge = useMemo(
    () => getSelectedChallenge(draft),
    [draft],
  );

  const updateDraft = (patch) => {
    setDraft((currentDraft) => ({ ...currentDraft, ...patch }));
  };

  const goBack = () => {
    stopRingtonePreview();

    if (onClose) {
      onClose();
      return;
    }

    router.back();
  };

  const saveAlarm = () => {
    stopRingtonePreview();

    if (onSaved) {
      onSaved(draft);
      return;
    }

    Alert.alert('Alarm saved', `${formatTime(draft)} - ${selectedChallenge.title}`, [
      { text: 'Done', onPress: () => router.replace('/home') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          onTouchStart={stopRingtonePreview}
          scrollEnabled={screenScrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          <NewAlarmHeader onBack={goBack} onSave={saveAlarm} title={headerTitle} />
          <View style={styles.section}>
            <TimeStep
              draft={draft}
              onWheelInteractionEnd={() => setScreenScrollEnabled(true)}
              onWheelInteractionStart={() => setScreenScrollEnabled(false)}
              updateDraft={updateDraft}
            />
          </View>
          <View style={styles.section}>
            <RepeatAlarmSettings draft={draft} updateDraft={updateDraft} />
          </View>
          <View style={styles.section}>
            <ChallengeStep draft={draft} updateDraft={updateDraft} />
          </View>
          <View style={styles.section}>
            <RingtonePicker draft={draft} updateDraft={updateDraft} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mode === 'edit' ? 'Save alarm changes' : 'Save alarm'}
            onPress={saveAlarm}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
          >
            <Text style={styles.saveText}>{mode === 'edit' ? 'Save Changes' : 'Save Alarm'}</Text>
          </Pressable>
        </ScrollView>
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
    gap: theme.space.lg,
    paddingBottom: theme.space.xxxl,
    paddingHorizontal: theme.space.lg,
    paddingTop: theme.space.sm,
  },
  section: {
    gap: theme.space.md,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    height: 54,
    justifyContent: 'center',
    marginTop: theme.space.sm,
    ...theme.shadows.glow,
  },
  saveText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.74,
  },
});
