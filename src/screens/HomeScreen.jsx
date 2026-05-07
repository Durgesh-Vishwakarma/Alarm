import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Switch, 
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, spacing, colors } from '../theme';

const MOCK_ALARMS = [
  { id: '1', time: '06:00', period: 'AM', label: 'Morning Workout', isActive: true },
  { id: '2', time: '07:30', period: 'AM', label: 'Deep Work', isActive: false },
  { id: '3', time: '08:00', period: 'AM', label: 'Leave for Office', isActive: true },
];

export const HomeScreen = () => {
  const [alarms, setAlarms] = useState(MOCK_ALARMS);
  
  const toggleAlarm = (id) => {
    setAlarms(current => 
      current.map(alarm => alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Alarms</Text>
      <ScrollView>
        {alarms.map(alarm => (
          <View key={alarm.id} style={[styles.alarmCard, !alarm.isActive && styles.alarmCardInactive]}>
            <View style={styles.cardHeader}>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{alarm.time} {alarm.period}</Text>
                <Text style={styles.labelText}>{alarm.label}</Text>
              </View>
              <Switch
                onValueChange={() => toggleAlarm(alarm.id)}
                value={alarm.isActive}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  alarmCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  alarmCardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeContainer: { flexDirection: 'column' },
  timeText: { fontSize: 40, fontWeight: 'bold', color: '#1a1a1a' },
  labelText: { fontSize: 16, color: '#666', marginTop: 4 },
});
