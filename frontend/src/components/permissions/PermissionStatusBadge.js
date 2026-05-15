import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';

const copy = {
  granted: 'Enabled',
  missing: 'Required',
  blocked: 'Blocked',
};

export function PermissionStatusBadge({ status }) {
  const isGranted = status === 'granted';

  return (
    <View style={[styles.badge, isGranted ? styles.granted : styles.missing]}>
      <Text style={[styles.text, isGranted ? styles.grantedText : styles.missingText]}>
        {copy[status] ?? 'Required'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  granted: {
    backgroundColor: 'rgba(21, 176, 113, 0.12)',
  },
  missing: {
    backgroundColor: theme.colors.primarySoft,
  },
  text: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
  },
  grantedText: {
    color: theme.colors.success,
  },
  missingText: {
    color: theme.colors.primary,
  },
});
