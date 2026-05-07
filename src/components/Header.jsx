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
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: colors.dot,
  },
  greeting: { fontFamily: typography.family.regular, fontSize: 13, color: colors.text.muted },
  userName: {
    fontFamily: typography.family.extraBold,
    fontSize: 20,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  topBarRight: { alignItems: 'flex-end' },
  countBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  countNumber: {
    fontFamily: typography.family.extraBold,
    fontSize: 16,
    color: colors.primary,
    lineHeight: 18,
  },
  countLabel: {
    fontFamily: typography.family.regular,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

export default Header;
