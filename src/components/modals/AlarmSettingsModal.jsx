import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, ScrollView,
  StyleSheet, Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  AI_CHALLENGES, DIFFICULTY_LEVELS, STRICTNESS_LEVELS,
  getChallengeById, getChallengeByTitle,
} from '../../data/challengeCatalog';
import { colors, typography } from '../../theme';
import WheelTimePicker from '../WheelPicker';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const RINGTONES = ['System Alarm', 'Default Ringtone', 'Classic Bell', 'Custom Audio', 'Silent'];

const getDefaultForm = () => ({
  hour: '06', minute: '00', period: 'AM', label: '',
  task: AI_CHALLENGES[0].title, challengeId: AI_CHALLENGES[0].id,
  difficulty: AI_CHALLENGES[0].difficulty, antiCheatStrictness: 'Strict',
  randomizeChallenge: true, multiStepChallenge: false,
  ringtone: RINGTONES[0], snoozeMinutes: 5,
  repeatDays: [...DAYS], isActive: true, requiresProof: true,
});

const Section = ({ title, icon, children, delay = 0 }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(400).springify()} style={s.section}>
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
    {children}
  </Animated.View>
);

const parseTime = (time) => {
  const [h = '06', m = '00'] = (time || '06:00').split(':');
  return { hour: h.padStart(2, '0'), minute: m.padStart(2, '0') };
};

const AlarmSettingsModal = ({
  visible, editingAlarm, onClose, onSave,
  permissionStatus = 'Not requested', onRequestPermission,
}) => {
  const [form, setForm] = useState(getDefaultForm);

  useEffect(() => {
    if (!visible) return;
    if (editingAlarm) {
      const { hour, minute } = parseTime(editingAlarm.time);
      setForm({
        hour, minute,
        period: editingAlarm.period || 'AM',
        label: editingAlarm.label || '',
        task: editingAlarm.task || getChallengeById(editingAlarm.challengeId).title,
        challengeId: editingAlarm.challengeId || getChallengeByTitle(editingAlarm.task).id,
        difficulty: editingAlarm.difficulty || getChallengeById(editingAlarm.challengeId).difficulty,
        antiCheatStrictness: editingAlarm.antiCheatStrictness || 'Strict',
        randomizeChallenge: editingAlarm.randomizeChallenge ?? true,
        multiStepChallenge: editingAlarm.multiStepChallenge ?? false,
        ringtone: editingAlarm.ringtone || RINGTONES[0],
        snoozeMinutes: editingAlarm.snoozeMinutes ?? 5,
        repeatDays: editingAlarm.repeatDays?.length ? editingAlarm.repeatDays : [...DAYS],
        isActive: editingAlarm.isActive ?? true,
        requiresProof: editingAlarm.requiresProof ?? true,
      });
    } else {
      setForm(getDefaultForm());
    }
  }, [editingAlarm, visible]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleDay = (day) => {
    Haptics.selectionAsync();
    setForm((p) => ({
      ...p,
      repeatDays: p.repeatDays.includes(day)
        ? p.repeatDays.filter((d) => d !== day)
        : [...p.repeatDays, day],
    }));
  };

  const selectChallenge = (c) => {
    Haptics.selectionAsync();
    setForm((p) => ({ ...p, task: c.title, challengeId: c.id, difficulty: p.difficulty || c.difficulty }));
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      id: editingAlarm?.id,
      time: `${form.hour}:${form.minute}`,
      period: form.period, label: form.label.trim() || 'Alarm',
      task: form.task, challengeId: form.challengeId,
      difficulty: form.difficulty, antiCheatStrictness: form.antiCheatStrictness,
      randomizeChallenge: form.randomizeChallenge, multiStepChallenge: form.multiStepChallenge,
      ringtone: form.ringtone, snoozeMinutes: Number(form.snoozeMinutes) || 5,
      repeatDays: form.repeatDays, isActive: form.isActive, requiresProof: form.requiresProof,
    });
  };

  const adjustSnooze = (delta) => {
    const next = Math.max(1, Math.min(30, (form.snoozeMinutes || 5) + delta));
    Haptics.selectionAsync();
    set('snoozeMinutes', next);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.dragBar} />

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={s.titleWrap}>
              <Text style={s.title}>{editingAlarm ? 'Edit Alarm' : 'New Alarm'}</Text>
              <Text style={s.subtitle}>AI-verified wake-up</Text>
            </View>
            <TouchableOpacity onPress={handleSave} style={s.saveBtn}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={s.saveTxt}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

            {/* ─── Time Picker ─── */}
            <Animated.View entering={FadeInDown.duration(500)} style={s.timeCard}>
              <Text style={s.timeLabel}>SET TIME</Text>
              <WheelTimePicker
                hour={form.hour}
                minute={form.minute}
                period={form.period}
                onChangeHour={(v) => set('hour', v)}
                onChangeMinute={(v) => set('minute', v)}
                onChangePeriod={(v) => set('period', v)}
              />
              <View style={s.timePreview}>
                <Ionicons name="alarm-outline" size={16} color={colors.primary} />
                <Text style={s.timePreviewTxt}>{form.hour}:{form.minute} {form.period}</Text>
              </View>
            </Animated.View>

            {/* ─── Schedule ─── */}
            <Section title="Schedule" icon="calendar-outline" delay={100}>
              <View style={s.dayRow}>
                {DAYS.map((day) => {
                  const active = form.repeatDays.includes(day);
                  return (
                    <TouchableOpacity key={day} style={[s.dayChip, active && s.dayChipOn]} onPress={() => toggleDay(day)}>
                      <Text style={[s.dayChipTxt, active && s.dayChipTxtOn]}>{day.charAt(0)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={s.labelRow}>
                <Ionicons name="pricetag-outline" size={16} color="#999" />
                <TextInput
                  style={s.labelInput}
                  value={form.label}
                  onChangeText={(v) => set('label', v)}
                  placeholder="Alarm label (optional)"
                  placeholderTextColor="#bbb"
                />
              </View>
            </Section>

            {/* ─── Wake-up Challenge ─── */}
            <Section title="Wake-up Challenge" icon="rocket-outline" delay={200}>
              <View style={s.challengeGrid}>
                {AI_CHALLENGES.map((c) => {
                  const on = form.challengeId === c.id;
                  return (
                    <TouchableOpacity key={c.id} style={[s.cBox, on && s.cBoxOn]} onPress={() => selectChallenge(c)} activeOpacity={0.7}>
                      <View style={[s.cIconWrap, on && s.cIconWrapOn]}>
                        <Ionicons name={c.icon} size={20} color={on ? '#fff' : colors.primary} />
                      </View>
                      <Text numberOfLines={2} style={[s.cTitle, on && s.cTitleOn]}>{c.title}</Text>
                      <Text style={[s.cMeta, on && s.cMetaOn]}>{c.difficulty} - {c.estimatedTime}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.optLabel}>Task Difficulty</Text>
              <View style={s.segRow}>
                {DIFFICULTY_LEVELS.map((lv) => (
                  <TouchableOpacity key={lv} style={[s.seg, form.difficulty === lv && s.segOn]} onPress={() => { Haptics.selectionAsync(); set('difficulty', lv); }}>
                    <Text style={[s.segTxt, form.difficulty === lv && s.segTxtOn]}>{lv}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.optLabel}>Anti-cheat Strictness</Text>
              <View style={s.segRow}>
                {STRICTNESS_LEVELS.map((lv) => (
                  <TouchableOpacity key={lv} style={[s.seg, form.antiCheatStrictness === lv && s.segOn]} onPress={() => { Haptics.selectionAsync(); set('antiCheatStrictness', lv); }}>
                    <Text style={[s.segTxt, form.antiCheatStrictness === lv && s.segTxtOn]}>{lv}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ToggleItem label="Require AI Verification" value={form.requiresProof} onChange={(v) => set('requiresProof', v)} icon="shield-checkmark-outline" />
              <ToggleItem label="Smart Randomization" value={form.randomizeChallenge} onChange={(v) => set('randomizeChallenge', v)} icon="shuffle-outline" />
              <ToggleItem label="Multi-step Challenge" value={form.multiStepChallenge} onChange={(v) => set('multiStepChallenge', v)} icon="layers-outline" />

              <View style={s.aiBox}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <Text style={s.aiBoxTxt}>
                  {getChallengeById(form.challengeId).aiType} - {Math.round(getChallengeById(form.challengeId).confidenceThreshold * 100)}% confidence
                </Text>
              </View>
            </Section>

            {/* ─── Sound & System ─── */}
            <Section title="Sound & System" icon="settings-outline" delay={300}>
              {/* Ringtone */}
              <Text style={s.optLabel}>Ringtone</Text>
              <View style={s.ringRow}>
                {RINGTONES.map((r) => (
                  <TouchableOpacity key={r} style={[s.ringChip, form.ringtone === r && s.ringChipOn]} onPress={() => { Haptics.selectionAsync(); set('ringtone', r); }}>
                    <Ionicons name={form.ringtone === r ? 'musical-note' : 'musical-note-outline'} size={14} color={form.ringtone === r ? '#fff' : '#999'} />
                    <Text style={[s.ringTxt, form.ringtone === r && s.ringTxtOn]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.nativeSoundBox}>
                <Ionicons name="information-circle-outline" size={17} color={colors.primary} />
                <Text style={s.nativeSoundText}>
                  System and custom alarm sounds need a development build. Expo Go uses vibration plus in-app alarm mode.
                </Text>
              </View>

              {/* Snooze Stepper */}
              <View style={s.snoozeRow}>
                <View style={s.snoozeInfo}>
                  <View style={s.selectorIconShell}><Ionicons name="timer-outline" size={16} color={colors.primary} /></View>
                  <Text style={s.snoozeLabel}>Snooze</Text>
                </View>
                <View style={s.stepper}>
                  <TouchableOpacity style={s.stepBtn} onPress={() => adjustSnooze(-1)}>
                    <Ionicons name="remove" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={s.stepVal}>{form.snoozeMinutes}m</Text>
                  <TouchableOpacity style={s.stepBtn} onPress={() => adjustSnooze(1)}>
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <ToggleItem label="Alarm enabled" value={form.isActive} onChange={(v) => set('isActive', v)} icon="notifications-outline" />

              {/* Permission */}
              <View style={s.permBox}>
                <View style={[s.selectorIconShell, { backgroundColor: permissionStatus === 'Granted' ? '#E8F5E9' : '#FFF3E0' }]}>
                  <Ionicons name="notifications-circle" size={18} color={permissionStatus === 'Granted' ? '#4CAF50' : '#FF9800'} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.permLabel}>Notification Permission</Text>
                  <Text style={[s.permStatus, permissionStatus === 'Granted' && { color: '#4CAF50' }]}>{permissionStatus}</Text>
                </View>
                {permissionStatus !== 'Granted' && (
                  <TouchableOpacity onPress={onRequestPermission} style={s.permBtn}>
                    <Text style={s.permBtnTxt}>Grant</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Section>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const ToggleItem = ({ label, value, onChange, icon }) => (
  <View style={s.toggleRow}>
    <View style={s.toggleLeft}>
      {icon && <Ionicons name={icon} size={16} color="#999" style={{ marginRight: 8 }} />}
      <Text style={s.toggleTxt}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#E8E8E8', true: colors.primary }}
      thumbColor="#fff"
      ios_backgroundColor="#E8E8E8"
    />
  </View>
);

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#F5F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '92%' },
  dragBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D0D0', alignSelf: 'center', marginTop: 10, marginBottom: 4 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  closeBtn: { width: 40, height: 40, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF' },
  titleWrap: { alignItems: 'center' },
  title: { fontSize: 18, fontFamily: typography.family.extraBold, color: colors.text.primary },
  subtitle: { fontSize: 11, fontFamily: typography.family.bold, color: '#999', marginTop: 1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  saveTxt: { color: '#fff', fontFamily: typography.family.bold, fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 50 },

  // Time Card
  timeCard: { backgroundColor: '#1C1C1C', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  timeLabel: { textAlign: 'center', fontFamily: typography.family.bold, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, marginBottom: 12 },
  timePreview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, backgroundColor: 'rgba(226,55,68,0.12)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'center' },
  timePreviewTxt: { fontFamily: typography.family.extraBold, fontSize: 16, color: colors.primary },

  // Section
  section: { backgroundColor: '#fff', borderRadius: 22, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionIconWrap: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontFamily: typography.family.extraBold, color: '#888', letterSpacing: 0.8, textTransform: 'uppercase' },

  // Days
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayChip: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  dayChipOn: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  dayChipTxt: { fontFamily: typography.family.bold, fontSize: 14, color: '#BBB' },
  dayChipTxtOn: { color: '#fff' },

  // Label
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: '#F0F0F0' },
  labelInput: { flex: 1, fontSize: 15, fontFamily: typography.family.bold, color: colors.text.primary, padding: 0 },

  // Challenges
  challengeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  cBox: { width: '48%', backgroundColor: '#F8F8F8', borderRadius: 16, padding: 14, alignItems: 'center', minHeight: 100, justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  cBoxOn: { backgroundColor: '#1C1C1C', borderColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  cIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cIconWrapOn: { backgroundColor: colors.primary },
  cTitle: { fontSize: 12, fontFamily: typography.family.bold, color: '#444', textAlign: 'center' },
  cTitleOn: { color: '#fff' },
  cMeta: { fontSize: 10, fontFamily: typography.family.bold, color: '#AAA', marginTop: 3, textAlign: 'center' },
  cMetaOn: { color: 'rgba(255,255,255,0.6)' },

  // Segments
  optLabel: { fontFamily: typography.family.bold, fontSize: 12, color: '#999', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: { flex: 1, alignItems: 'center', backgroundColor: '#F5F5F5', paddingVertical: 11, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent' },
  segOn: { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 2 },
  segTxt: { fontFamily: typography.family.bold, fontSize: 12, color: '#999' },
  segTxtOn: { color: '#fff' },

  // Toggles
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  toggleTxt: { fontFamily: typography.family.bold, fontSize: 14, color: colors.text.primary },

  // AI Info
  aiBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryLight, borderRadius: 14, padding: 12, marginTop: 16, borderWidth: 1, borderColor: '#F7DADB' },
  aiBoxTxt: { flex: 1, fontFamily: typography.family.bold, fontSize: 12, color: colors.text.primary },

  // Ringtones
  ringRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ringChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5, borderColor: 'transparent' },
  ringChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  ringTxt: { fontFamily: typography.family.bold, fontSize: 11, color: '#888' },
  ringTxtOn: { color: '#fff' },
  nativeSoundBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.primaryLight, borderRadius: 14, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#F7DADB' },
  nativeSoundText: { flex: 1, fontFamily: typography.family.bold, fontSize: 11, lineHeight: 16, color: colors.text.primary },

  // Snooze
  snoozeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  snoozeInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectorIconShell: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  snoozeLabel: { fontFamily: typography.family.bold, fontSize: 14, color: colors.text.primary },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14, overflow: 'hidden' },
  stepBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  stepVal: { fontFamily: typography.family.extraBold, fontSize: 14, color: colors.text.primary, minWidth: 36, textAlign: 'center' },

  // Permission
  permBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 14, borderRadius: 14, marginTop: 14, borderWidth: 1, borderColor: '#F0F0F0' },
  permLabel: { fontFamily: typography.family.bold, fontSize: 13, color: colors.text.primary },
  permStatus: { fontSize: 11, fontFamily: typography.family.bold, color: '#FF9800', marginTop: 1 },
  permBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  permBtnTxt: { fontFamily: typography.family.bold, fontSize: 12, color: '#fff' },
});

export default AlarmSettingsModal;
