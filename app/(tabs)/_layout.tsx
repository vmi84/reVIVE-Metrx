import { Tabs } from 'expo-router';
// @ts-ignore — bundled with expo, types resolved at runtime
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/utils/constants';
import { HelpButton } from '../../components/ui/HelpButton';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerRight: () => <HelpButton screen="home" />,
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
      <Tabs.Screen
        name="recovery"
        options={{
          title: 'Recovery',
          tabBarLabel: 'Recover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
          headerRight: () => <HelpButton screen="recovery" />,
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: 'Effort Guide',
          tabBarLabel: 'Effort',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle-outline" size={size} color={color} />
          ),
          headerRight: () => <HelpButton screen="effort" />,
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarLabel: 'Trends',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
          headerRight: () => <HelpButton screen="trends" />,
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          headerRight: () => <HelpButton screen="settings" />,
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
    </Tabs>
  );
}
