import {
  Tabs,
} from 'expo-router';

import {
  TabGlyph,
} from '@/components/TabGlyph';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({
            focused,
          }) => (
            <TabGlyph
              glyph="◎"
              focused={
                focused
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="apps"
        options={{
          title: 'Apps',
          tabBarIcon: ({
            focused,
          }) => (
            <TabGlyph
              glyph="▤"
              focused={
                focused
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="usage"
        options={{
          title: 'Usage',
          tabBarIcon: ({
            focused,
          }) => (
            <TabGlyph
              glyph="◔"
              focused={
                focused
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({
            focused,
          }) => (
            <TabGlyph
              glyph="⚙"
              focused={
                focused
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}