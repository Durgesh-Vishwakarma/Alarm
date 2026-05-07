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
import AlarmSettingsModal from '../components/modals/AlarmSettingsModal';
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
  const [permissionStatus, setPermissionStatus] = useState('Not requested');

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

  const closeSettings = () => {
    setModalVisible(false);
    setEditingAlarm(null);
  };

  const handleSaveAlarm = (payload) => {
    setAlarms((current) => {
      if (payload.id) {
        return current.map((alarm) => (alarm.id === payload.id ? { ...alarm, ...payload } : alarm));
      }
      return [{ ...payload, id: Date.now().toString() }, ...current];
    });
    closeSettings();
  };

  const handleRequestPermission = () => {
    setPermissionStatus('Requested (mock)');
  };

  const renderAlarmCard = ({ item }) => {
    const isActive = item.isActive;
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const activeDays = item.repeatDays || ['M', 'W', 'F'];

    return (
      <TouchableOpacity
        style={[styles.alarmCard, !isActive && styles.alarmCardInactive]}
        activeOpacity={0.8}
        onPress={() => openSettings(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headingContainer}>
            <Text style={[styles.alarmHeading, !isActive && styles.inactiveText]}>
              {item.label || 'Untitled Alarm'}
            </Text>
            <View style={styles.dayIndicatorRow}>
              {days.map((day, index) => {
                const isDayActive = activeDays.includes(day);
                return (
                  <Text
                    key={`${day}-${index}`}
                    style={[
                      styles.dayTinyText,
                      isDayActive && isActive ? styles.dayTinyTextActive : styles.dayTinyTextInactive,
                    ]}
                  >
                    {day}
                  </Text>
                );
              })}
            </View>
          </View>

          <Switch
            trackColor={{ false: colors.dot, true: colors.primary }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.dot}
            onValueChange={() => toggleAlarm(item.id)}
            value={isActive}
          />
        </View>

        <View style={styles.timeRow}>
          <Text style={[styles.timeText, !isActive && styles.inactiveText]}>{item.time}</Text>
          <Text style={[styles.periodText, !isActive && styles.inactiveText]}>{item.period}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.taskBadge, !isActive && styles.taskBadgeInactive]}>
            <Ionicons name="rocket-sharp" size={14} color={isActive ? colors.primary : colors.text.muted} />
            <Text style={[styles.taskText, !isActive && styles.inactiveText]}>{item.task}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.border} style={styles.cardChevron} />
        </View>
      </TouchableOpacity>
    );
  };

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
        onClose={closeSettings}
        onSave={handleSaveAlarm}
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestPermission}
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
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 120, paddingTop: spacing.md },

  alarmCard: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  alarmCardInactive: {
    backgroundColor: '#F9F9F9',
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headingContainer: { flex: 1 },
  alarmHeading: {
    fontFamily: typography.family.bold,
    fontSize: 17,
    color: colors.text.primary,
    marginBottom: 6,
  },
  dayIndicatorRow: { flexDirection: 'row', gap: 8 },
  dayTinyText: { fontSize: 11, fontFamily: typography.family.bold },
  dayTinyTextActive: { color: colors.primary },
  dayTinyTextInactive: { color: '#D1D1D1' },

  timeRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 6 },
  timeText: {
    fontFamily: typography.family.extraBold,
    fontSize: 44,
    color: colors.text.primary,
    letterSpacing: -1,
  },
  periodText: {
    fontFamily: typography.family.bold,
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 6,
    opacity: 0.8,
  },
  inactiveText: { color: '#BDBDBD' },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },

  taskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  taskBadgeInactive: { backgroundColor: '#F0F0F0' },
  taskText: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
  },
  cardChevron: { marginLeft: 'auto' },

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
