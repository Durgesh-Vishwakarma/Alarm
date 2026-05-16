import { StyleSheet, View } from 'react-native';

import { ScannerFrame } from './ScannerFrame';
import { ScannerGuide } from './ScannerGuide';

export function ScannerOverlay({ challengeTitle }) {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <ScannerGuide
        body="Gallery and screenshots are not accepted."
        title={`Capture ${challengeTitle}`}
      />
      <ScannerFrame />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    gap: 26,
  },
});
