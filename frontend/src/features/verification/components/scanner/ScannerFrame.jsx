import { StyleSheet, View } from 'react-native';

import { theme } from '../../../../shared/theme';

export function ScannerFrame() {
  return <View pointerEvents="none" style={styles.frame} />;
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    borderWidth: 2,
    height: 280,
    width: '78%',
  },
});
