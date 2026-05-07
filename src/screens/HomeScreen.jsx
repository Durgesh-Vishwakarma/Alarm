import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlarmSettingsModal } from '../components/modals/AlarmSettingsModal';
import { colors, spacing, typography } from '../theme';

const MOCK_ALARMS = [
  { id: '1', time: '06:00', period: 'AM', label: 'Morning Workout', task: 'Scan Dumbbell', isActive: true },
  { id: '2', time: '07:30', period: 'AM', label: 'Deep Work', task: 'Scan Coffee Mug', isActive: false },
  { id: '3', time: '08:00', period: 'AM', label: 'Leave for Office', task: 'Scan Keys', isActive: true },
];

export const HomeScreen = () => {
  const [alarms, setAlarms] = useState(MOCK_ALARMS);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);

  const toggleAlarm = (id) => {
    setAlarms((current) =>
      current.map((alarm) =>
        alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
      )
    );
  };

  const openSettings = (alarm = null) => {
    setEditingAlarm(alarm);
    setModalVisible(true);
  };

  const renderAlarmCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.alarmCard, !item.isActive && styles.alarmCardInactive]}
      activeOpacity={0.7}
      onPress={() => openSettings(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, !item.isActive && styles.inactiveText]}>{item.time}</Text>
          <Text style={[styles.periodText, !item.isActive && styles.inactiveText]}>{item.period}</Text>
        </View>
        <Switch
          trackColor={{ false: colors.dot, true: colors.primary }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.dot}
          onValueChange={() => toggleAlarm(item.id)}
          value={item.isActive}
        />
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.labelText, !item.isActive && styles.inactiveText]} numberOfLines={1}>
          {item.label}
        </Text>
        <View style={[styles.taskBadge, !item.isActive && styles.taskBadgeInactive]}>
          <Ionicons name="camera-outline" size={14} color={item.isActive ? colors.primary : colors.text.secondary} />
          <Text style={[styles.taskText, !item.isActive && styles.inactiveText]} numberOfLines={1}>
            {item.task}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Good Evening,</Text>
              <Text style={styles.userName}>Durgesh</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={renderAlarmCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => openSettings(null)}>
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
      </SafeAreaView>

      <AlarmSettingsModal
        visible={isModalVisible}
        editingAlarm={editingAlarm}
        onClose={() => setModalVisible(false)}
        onSave={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: colors.dot,
  },
  greeting: { fontFamily: typography.family.regular, fontSize: 13, color: colors.text.secondary },
  userName: {
    fontFamily: typography.family.extraBold,
    fontSize: 20,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100, paddingTop: spacing.sm },

  alarmCard: {
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  alarmCardInactive: {
    backgroundColor: colors.inactive,
    borderColor: colors.inactiveBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeContainer: { flexDirection: 'row', alignItems: 'baseline' },
  timeText: {
    fontFamily: typography.family.extraBold,
    fontSize: 42,
    color: colors.text.primary,
    letterSpacing: -1.5,
  },
  periodText: { fontFamily: typography.family.bold, fontSize: 16, color: colors.text.primary, marginLeft: 4 },
  inactiveText: { color: colors.text.muted },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  labelText: {
    fontFamily: typography.family.bold,
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
    paddingRight: 10,
  },

  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 1,
  },
  taskBadgeInactive: { backgroundColor: colors.tabBackground },
  taskText: {
    fontFamily: typography.family.bold,
    fontSize: 11,
    color: colors.primary,
    marginLeft: 6,
    textTransform: 'uppercase',
    flexShrink: 1,
  },

  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  
});
