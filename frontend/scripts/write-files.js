const fs = require('fs');
fs.writeFileSync('src/screens/HomeScreen.jsx', \import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, spacing, colors } from '../theme';

const MOCK_ALARMS = [
  { id: '1', time: '06:00', period: 'AM', label: 'Morning Workout', isActive: true },
  { id: '2', time: '07:30', period: 'AM', label: 'Deep Work', isActive: false },
];

export const HomeScreen = () => {
  const [alarms, setAlarms] = useState(MOCK_ALARMS);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Alarms</Text>
      <ScrollView>
        {alarms.map(alarm => (
          <View key={alarm.id} style={styles.alarmCard}>
            <Text style={styles.timeText}>{alarm.time} {alarm.period}</Text>
            <Text style={styles.labelText}>{alarm.label}</Text>
            <Switch value={alarm.isActive} onValueChange={() => {}} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors?.background || '#fff', padding: spacing?.m || 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: colors?.text || '#000', marginBottom: spacing?.m || 16 },
  alarmCard: { backgroundColor: colors?.surface || '#f5f5f5', padding: spacing?.m || 16, borderRadius: 12, marginBottom: spacing?.s || 8 },
  timeText: { fontSize: 32, fontWeight: 'bold', color: colors?.text || '#000' },
  labelText: { fontSize: 16, color: colors?.textSecondary || '#666' },
});\);

fs.writeFileSync('app/(tabs)/_layout.jsx', \import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name='home' options={{ title: 'Home' }} />
      <Tabs.Screen name='streaks' options={{ title: 'Streaks' }} />
      <Tabs.Screen name='settings' options={{ title: 'Settings' }} />
    </Tabs>
  );
}\);

fs.writeFileSync('app/(tabs)/settings.jsx', \import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
}
const styles = StyleSheet.create({ 
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' }
});\);

fs.writeFileSync('app/(tabs)/streaks.jsx', \import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StreaksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Streaks</Text>
    </View>
  );
}
const styles = StyleSheet.create({ 
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' }
});\);

