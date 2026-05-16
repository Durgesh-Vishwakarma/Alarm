import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../../shared/theme';

export function ScannerGuide({ title, body }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: theme.space.xl,
  },
  title: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    textAlign: 'center',
  },
  body: {
    color: 'rgba(255,255,255,0.76)',
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.space.xs,
    textAlign: 'center',
  },
});
