import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const RINGTONES = ['Classic Bell', 'Neon Pulse', 'Morning Rise', 'Deep Focus'];
const TASKS = ['Scan Toothbrush', 'Scan Coffee Mug', 'Scan Keys', 'Scan Water Bottle'];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const ITEM_HEIGHT = 50;

const SettingSection = ({ title, children, icon, style }) => (
  <View style={[styles.sectionCard, style]}>
    <View style={styles.sectionHeader}>
      {icon ? <Ionicons name={icon} size={18} color={colors.primary} style={styles.sectionIcon} /> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const parseTime = (time) => {
  const [rawHour = '06', rawMinute = '00'] = (time || '06:00').split(':');
  const hour = rawHour.padStart(2, '0');
  const minute = rawMinute.padStart(2, '0');
  return { hour, minute };
};

const AlarmSettingsModal = ({
  visible,
  editingAlarm,
  onClose,
  onSave,
  permissionStatus = 'Not requested',
  onRequestPermission,
}) => {
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  const [formData, setFormData] = useState({
    hour: '06',
    minute: '00',
    period: 'AM',
    label: '',
    task: TASKS[0],
    ringtone: RINGTONES[0],
    snoozeMinutes: '5',
    repeatDays: DAYS,
    isActive: true,
    requiresProof: true,
  });

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (editingAlarm) {
      const { hour, minute } = parseTime(editingAlarm.time);
      setFormData({
        hour,
        minute,
        period: editingAlarm.period || 'AM',
        label: editingAlarm.label || '',
        task: editingAlarm.task || TASKS[0],
        ringtone: editingAlarm.ringtone || RINGTONES[0],
        snoozeMinutes: String(editingAlarm.snoozeMinutes ?? 5),
        repeatDays: editingAlarm.repeatDays?.length ? editingAlarm.repeatDays : DAYS,
        isActive: editingAlarm.isActive ?? true,
        requiresProof: editingAlarm.requiresProof ?? true,
      });
      return;
    }

    setFormData({
      hour: '06',
      minute: '00',
      period: 'AM',
      label: '',
      task: TASKS[0],
      ringtone: RINGTONES[0],
      snoozeMinutes: '5',
      repeatDays: DAYS,
      isActive: true,
      requiresProof: true,
    });
  }, [editingAlarm, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const hourIndex = Math.max(0, HOURS.indexOf(formData.hour));
    const minuteIndex = Math.max(0, MINUTES.indexOf(formData.minute));

    setTimeout(() => {
      hourScrollRef.current?.scrollTo({ y: hourIndex * ITEM_HEIGHT, animated: false });
      minuteScrollRef.current?.scrollTo({ y: minuteIndex * ITEM_HEIGHT, animated: false });
    }, 0);
  }, [formData.hour, formData.minute, visible]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const repeatDays = prev.repeatDays.includes(day)
        ? prev.repeatDays.filter((d) => d !== day)
        : [...prev.repeatDays, day];
      return { ...prev, repeatDays };
    });
  };

  const handlePickerScroll = (data, offsetY, field) => {
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const value = data[Math.max(0, Math.min(index, data.length - 1))];
    updateField(field, value);
  };

  const handleSave = () => {
    const time = `${formData.hour}:${formData.minute}`;

    onSave({
      id: editingAlarm?.id,
      time,
      period: formData.period,
      label: formData.label.trim() || 'Alarm',
      task: formData.task,
      ringtone: formData.ringtone,
      snoozeMinutes: Number(formData.snoozeMinutes) || 5,
      repeatDays: formData.repeatDays,
      isActive: formData.isActive,
      requiresProof: formData.requiresProof,
    });
  };

  const renderScrollPicker = (data, selectedValue, onSelect, scrollRef) => (
    <View style={styles.pickerContainer}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => onSelect(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => onSelect(e.nativeEvent.contentOffset.y)}
      >
        <View style={styles.pickerSpacer}>
          {data.map((value) => (
            <View key={value} style={styles.pickerItem}>
              <Text style={[styles.pickerText, selectedValue === value && styles.pickerTextActive]}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View pointerEvents="none" style={styles.pickerHighlight} />
    </View>
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={26} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingAlarm ? 'Edit Alarm' : 'New Alarm'}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
              <Text style={styles.saveHeaderText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
            <View style={styles.timePickerRow}>
              {renderScrollPicker(
                HOURS,
                formData.hour,
                (offsetY) => handlePickerScroll(HOURS, offsetY, 'hour'),
                hourScrollRef
              )}
              <Text style={styles.timeSeparator}>:</Text>
              {renderScrollPicker(
                MINUTES,
                formData.minute,
                (offsetY) => handlePickerScroll(MINUTES, offsetY, 'minute'),
                minuteScrollRef
              )}
              <View style={styles.periodColumn}>
                {['AM', 'PM'].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => updateField('period', value)}
                    style={[styles.periodPill, formData.period === value && styles.periodPillActive]}
                  >
                    <Text style={[styles.periodPillText, formData.period === value && styles.periodPillTextActive]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                value={formData.hour}
                onChangeText={(value) => updateField('hour', value.padStart(2, '0'))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="06"
                placeholderTextColor={colors.text.secondary}
              />
              <Text style={styles.manualSeparator}>:</Text>
              <TextInput
                style={styles.manualInput}
                value={formData.minute}
                onChangeText={(value) => updateField('minute', value.padStart(2, '0'))}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <SettingSection title="Schedule" icon="calendar-outline" style={styles.scheduleSection}>
              <View style={styles.dayRow}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayCircle, formData.repeatDays.includes(day) && styles.dayCircleActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayText, formData.repeatDays.includes(day) && styles.dayTextActive]}>
                      {day.charAt(0)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.labelInputContainer}>
                <TextInput
                  style={styles.labelInput}
                  value={formData.label}
                  onChangeText={(value) => updateField('label', value)}
                  placeholder="Alarm label (optional)"
                  placeholderTextColor={colors.text.secondary}
                />
                <Ionicons name="pencil" size={16} color={colors.text.secondary} />
              </View>
            </SettingSection>

            <SettingSection title="Wake-up Challenge" icon="rocket-outline">
              <View style={styles.challengeGrid}>
                {TASKS.map((task) => {
                  const isSelected = formData.task === task;
                  return (
                    <TouchableOpacity
                      key={task}
                      style={[styles.challengeBox, isSelected && styles.challengeBoxActive]}
                      onPress={() => updateField('task', task)}
                    >
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'camera-outline'}
                        size={20}
                        color={isSelected ? colors.white : colors.primary}
                      />
                      <Text
                        numberOfLines={2}
                        style={[styles.challengeText, isSelected && styles.challengeTextActive]}
                      >
                        {task}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Require AI Verification</Text>
                <Switch
                  value={formData.requiresProof}
                  onValueChange={(value) => updateField('requiresProof', value)}
                  trackColor={{ true: colors.primary }}
                />
              </View>
            </SettingSection>

            <SettingSection title="Sound & System" icon="settings-outline">
              <View style={styles.selectorRow}>
                <Text style={styles.selectorLabel}>Ringtone</Text>
                <Text style={styles.selectorValue}>{formData.ringtone} ></Text>
              </View>
              <View style={styles.selectorRow}>
                <Text style={styles.selectorLabel}>Snooze</Text>
                <TextInput
                  style={styles.snoozeInput}
                  value={formData.snoozeMinutes}
                  onChangeText={(value) => updateField('snoozeMinutes', value)}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor={colors.text.secondary}
                />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Alarm enabled</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => updateField('isActive', value)}
                  trackColor={{ true: colors.primary }}
                />
              </View>
              <View style={styles.permissionBox}>
                <Ionicons name="notifications-circle" size={24} color={colors.text.secondary} />
                <View style={styles.permissionInfo}>
                  <Text style={styles.permText}>Notifications</Text>
                  <Text style={styles.permStatus}>{permissionStatus}</Text>
                </View>
                <TouchableOpacity onPress={onRequestPermission} style={styles.permBtn}>
                  <Text style={styles.permBtnText}>Fix</Text>
                </TouchableOpacity>
              </View>
            </SettingSection>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#F2F2F2',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  iconButton: { padding: 4 },
  modalTitle: { fontSize: 20, fontFamily: typography.family.extraBold },
  saveHeaderButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  saveHeaderText: { color: colors.white, fontFamily: typography.family.bold },
  scrollPadding: { padding: 20, paddingBottom: 60 },

  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    height: 180,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pickerContainer: { height: 150, width: 80 },
  pickerSpacer: { paddingVertical: 50 },
  pickerItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  pickerText: { fontSize: 32, color: '#DDD', fontFamily: typography.family.bold },
  pickerTextActive: { fontSize: 48, color: colors.text.primary, fontFamily: typography.family.extraBold },
  pickerHighlight: {
    position: 'absolute',
    top: (150 - ITEM_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: 'rgba(226,55,68,0.06)',
  },
  timeSeparator: { fontSize: 40, fontFamily: typography.family.extraBold, marginHorizontal: 10 },
  periodColumn: { marginLeft: 20, gap: 10 },
  periodPill: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12, backgroundColor: '#F0F0F0' },
  periodPillActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  periodPillText: { fontFamily: typography.family.bold, color: colors.text.secondary },
  periodPillTextActive: { color: colors.primary },

  manualRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 24 },
  manualInput: {
    width: 64,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontFamily: typography.family.bold,
    fontSize: 18,
    color: colors.text.primary,
  },
  manualSeparator: { fontFamily: typography.family.extraBold, fontSize: 18, color: colors.text.primary },

  sectionCard: { backgroundColor: colors.white, borderRadius: 24, padding: 24, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  sectionIcon: { marginRight: 4 },
  sectionTitle: { fontSize: 13, fontFamily: typography.family.bold, color: '#888', letterSpacing: 1 },

  scheduleSection: { paddingBottom: 28 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: { backgroundColor: colors.primary },
  dayText: { fontFamily: typography.family.bold, color: '#999' },
  dayTextActive: { color: colors.white },
  labelInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  labelInput: { flex: 1, fontSize: 16, fontFamily: typography.family.bold, color: colors.text.primary },

  challengeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  challengeBox: {
    width: '48%',
    backgroundColor: '#F7F7F7',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 70,
  },
  challengeBoxActive: { backgroundColor: colors.text.primary },
  challengeText: { fontSize: 12, fontFamily: typography.family.bold, color: '#444', flex: 1 },
  challengeTextActive: { color: colors.white },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  toggleText: { fontFamily: typography.family.bold, fontSize: 15 },

  selectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  selectorLabel: { fontFamily: typography.family.bold },
  selectorValue: { color: colors.primary, fontFamily: typography.family.bold },
  snoozeInput: {
    minWidth: 60,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    textAlign: 'center',
    fontFamily: typography.family.bold,
  },

  permissionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  permissionInfo: { flex: 1, marginLeft: 10 },
  permText: { fontFamily: typography.family.bold, fontSize: 13 },
  permStatus: { fontSize: 11, color: 'red' },
  permBtn: { backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  permBtnText: { fontFamily: typography.family.bold },
});

export default AlarmSettingsModal;
