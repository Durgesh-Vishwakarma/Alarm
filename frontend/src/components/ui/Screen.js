import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../theme';

export function Screen({ children, scroll = false, contentStyle }) {
  const Content = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Content
        contentContainerStyle={scroll ? [styles.scrollContent, contentStyle] : undefined}
        showsVerticalScrollIndicator={false}
        style={!scroll ? [styles.content, contentStyle] : undefined}
      >
        {children}
      </Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.space.xl,
    paddingTop: theme.space.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.space['2xl'],
    paddingHorizontal: theme.space.xl,
    paddingTop: theme.space.lg,
  },
});
