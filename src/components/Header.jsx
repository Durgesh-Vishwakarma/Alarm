import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

const Header = ({ greeting, name, avatarUri, activeCount }) => {
  return (
    <View style={styles.topBar}>
      <View style={styles.profileSection}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{name}</Text>
        </View>
      </View>
      <View style={styles.topBarRight}>
        <View style={styles.countBadge}>
          <Ionicons name="alarm" size={14} color={colors.primary} />
          <Text style={styles.countNumber}>{activeCount}</Text>
          <Text style={styles.countLabel}>Active</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.dot,
    borderWidth: 3,
    borderColor: colors.white,
  },
  greeting: { fontFamily: typography.family.regular, fontSize: 13, color: colors.text.muted },
  userName: {
    fontFamily: typography.family.extraBold,
    fontSize: 20,
    color: colors.primary,
    letterSpacing: 0,
  },
  topBarRight: { alignItems: 'flex-end' },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: '#F0D7D9',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  countNumber: {
    fontFamily: typography.family.extraBold,
    fontSize: 16,
    color: colors.primary,
    lineHeight: 17,
  },
  countLabel: {
    fontFamily: typography.family.bold,
    fontSize: 11,
    color: colors.text.secondary,
  },
});

export default Header;
