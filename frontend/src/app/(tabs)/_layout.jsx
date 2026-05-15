import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { theme } from '../../theme';

const icons = {
  index: ['home', 'home-outline'],
  streak: ['flame', 'flame-outline'],
  setting: ['settings', 'settings-outline'],
};

function TabIcon({ name, focused, color, size }) {
  const [activeIcon, inactiveIcon] = icons[name];
  return <Ionicons name={focused ? activeIcon : inactiveIcon} color={color} size={size} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: theme.fonts.bodyMedium,
          fontSize: theme.fontSizes.xs,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 72,
          paddingBottom: theme.space.md,
          paddingTop: theme.space.sm,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon name={route.name} focused={focused} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="streak" options={{ title: 'Streak' }} />
      <Tabs.Screen name="setting" options={{ title: 'Setting' }} />
    </Tabs>
  );
}
