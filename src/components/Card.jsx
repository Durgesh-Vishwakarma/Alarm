import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';

export const Card = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 20, 
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    
    // Premium Shadow System
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
});
