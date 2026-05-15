import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

export function Screen({ eyebrow, title, children }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function Panel({ children }) {
  return <View style={styles.panel}>{children}</View>;
}

export function BodyText({ children }) {
  return <Text style={styles.body}>{children}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.space.xl,
    paddingTop: theme.space.xl,
    gap: theme.space.xl,
  },
  header: {
    gap: theme.space.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.xl,
    lineHeight: 36,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.space.xl,
    gap: theme.space.md,
    ...theme.shadows.soft,
  },
  body: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
});
