import { Alert, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { theme } from '../../theme';
import { FooterActions } from './components/FooterActions';
import { NewAlarmHeader } from './components/NewAlarmHeader';
import { StepProgress } from './components/StepProgress';
import { TimeStep } from './components/TimeStep';
import { initialAlarmDraft, steps } from './data';
import { formatTime, getSelectedChallenge } from './utils';

function getStepComponent(step) {
  if (step === 1) {
    return require('./components/RepeatStep').RepeatStep;
  }

  if (step === 2) {
    return require('./components/ChallengeStep').ChallengeStep;
  }

  if (step === 3) {
    return require('./components/SettingsStep').SettingsStep;
  }

  return TimeStep;
}

export function NewAlarmScreen({
  initialDraft = initialAlarmDraft,
  mode = 'create',
  onClose,
  onSaved,
} = {}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState(initialDraft);
  const [screenScrollEnabled, setScreenScrollEnabled] = useState(true);
  const headerTitle = mode === 'edit' ? 'Edit Alarm' : 'New Alarm';

  useEffect(() => {
    setDraft(initialDraft);
    setCurrentStep(0);
    setScreenScrollEnabled(true);
  }, [initialDraft]);

  const selectedChallenge = useMemo(
    () => getSelectedChallenge(draft),
    [draft],
  );

  const updateDraft = (patch) => {
    setDraft((currentDraft) => ({ ...currentDraft, ...patch }));
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
      return;
    }

    if (onClose) {
      onClose();
      return;
    }

    router.back();
  };

  const saveAlarm = () => {
    Alert.alert(
      'Alarm saved',
      `${formatTime(draft)} - ${selectedChallenge.title}`,
      [
        {
          text: 'Done',
          onPress: () => {
            if (onSaved) {
              onSaved(draft);
              return;
            }

            router.replace('/');
          },
        },
      ],
    );
  };

  const continueFlow = () => {
    if (currentStep === steps.length - 1) {
      saveAlarm();
      return;
    }

    setCurrentStep((step) => step + 1);
  };

  const contentStyle = [
    styles.content,
    width >= 760 && currentStep === 3 ? styles.contentWide : null,
  ];
  const CurrentStepComponent = getStepComponent(currentStep);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={contentStyle}
          scrollEnabled={screenScrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          <NewAlarmHeader onBack={goBack} onSave={saveAlarm} title={headerTitle} />
          <StepProgress currentStep={currentStep} onStepPress={setCurrentStep} />

          {currentStep === 0 ? (
            <CurrentStepComponent
              draft={draft}
              goToStep={setCurrentStep}
              onWheelInteractionEnd={() => setScreenScrollEnabled(true)}
              onWheelInteractionStart={() => setScreenScrollEnabled(false)}
              selectedChallenge={selectedChallenge}
              updateDraft={updateDraft}
            />
          ) : null}

          {currentStep === 1 ? (
            <CurrentStepComponent draft={draft} updateDraft={updateDraft} />
          ) : null}

          {currentStep === 2 ? (
            <CurrentStepComponent draft={draft} updateDraft={updateDraft} />
          ) : null}

          {currentStep === 3 ? (
            <CurrentStepComponent
              draft={draft}
              selectedChallenge={selectedChallenge}
              updateDraft={updateDraft}
            />
          ) : null}
        </ScrollView>

        <FooterActions
          currentStep={currentStep}
          isLastStep={currentStep === steps.length - 1}
          onBack={goBack}
          onContinue={continueFlow}
        />
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
    paddingBottom: 112,
    paddingHorizontal: 22,
    paddingTop: theme.space.md,
  },
  contentWide: {
    maxWidth: 1120,
    width: '100%',
  },
});
