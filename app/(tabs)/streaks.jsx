import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme';

export default function StreaksTab() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.text}>Streaks</Text>
        <Text style={styles.subtext}>Coming Soon</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontFamily: typography.family.extraBold, fontSize: 24, color: '#1C1C1C' },
  subtext: { fontFamily: typography.family.regular, fontSize: 16, color: '#666666', marginTop: 8 },
});
