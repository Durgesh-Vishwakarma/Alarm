import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export const AlarmSettingsModal = ({ visible, editingAlarm, onClose, onSave }) => {
  const handleSave = () => {
    if (onSave) {
      onSave();
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingAlarm ? 'Edit Alarm' : 'New Alarm'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.timePickerMock}>
            <Text style={styles.timePickerText}>{editingAlarm ? editingAlarm.time : '06:00'}</Text>
            <Text style={styles.timePickerPeriod}>{editingAlarm ? editingAlarm.period : 'AM'}</Text>
          </View>

          <Text style={styles.inputLabel}>Alarm Label</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning Workout"
            defaultValue={editingAlarm?.label || ''}
            placeholderTextColor={colors.text.secondary}
          />

          <Text style={styles.inputLabel}>Required AI Task</Text>
          <TouchableOpacity style={styles.taskSelector}>
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.taskSelectorText}>
              {editingAlarm?.task || 'Select Object to Scan...'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Alarm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: spacing.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 24,
    color: colors.text.primary,
  },
  closeCircle: {
    backgroundColor: colors.tabBackground,
    borderRadius: 16,
    padding: 6,
  },
  timePickerMock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: spacing.xl,
  },
  timePickerText: {
    fontFamily: typography.family.extraBold,
    fontSize: 64,
    color: colors.text.primary,
  },
  timePickerPeriod: {
    fontFamily: typography.family.bold,
    fontSize: 24,
    color: colors.primary,
    marginLeft: 8,
  },
  inputLabel: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 16,
    fontFamily: typography.family.regular,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  taskSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: spacing.xl,
  },
  taskSelectorText: {
    flex: 1,
    fontFamily: typography.family.bold,
    fontSize: 16,
    color: colors.primary,
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: typography.family.bold,
    fontSize: 18,
    color: colors.white,
  },
});
