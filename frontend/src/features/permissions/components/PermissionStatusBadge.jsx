import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';

const copy = {
  granted: 'Ready',
  missing: 'Required',
  blocked: 'Settings',
};

export function PermissionStatusBadge({ status }) {
  const granted = status === 'granted';

  return (
    <View style={[styles.badge, granted ? styles.granted : styles.required]}>
      <Text style={[styles.text, granted ? styles.grantedText : styles.requiredText]}>
        {copy[status] ?? 'Required'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  granted: {
    backgroundColor: '#EAFBEA',
  },
  required: {
    backgroundColor: '#FFF0E8',
  },
  text: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 9,
  },
  grantedText: {
    color: '#54B948',
  },
  requiredText: {
    color: theme.colors.primary,
  },
});
