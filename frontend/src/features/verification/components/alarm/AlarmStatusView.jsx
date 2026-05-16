import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../../shared/theme';

export function AlarmStatusView({ message = 'Live camera verification only.' }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.white} />
      <Text style={styles.text}>Verification Required</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(207, 68, 0, 0.46)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: theme.radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    paddingVertical: 9,
  },
  text: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
    textAlign: 'center',
  },
});
