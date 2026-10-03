import {
  StyleSheet,
  View,
} from 'react-native';

import { Tabs } from 'expo-router';

import { Icon } from '@/components/Icon';

import { colors } from '@/theme';

function TabIcon({
  name,
  focused,
}: {
  name: 'dashboard' | 'apps' | 'settings';
  focused: boolean;
}) {

  return (
    <View style={styles.iconWrap}>
      {focused ? (
        <View
          style={styles.pill}
        />
      ) : null}

      <Icon
        name={name}
        size={22}
        color={
          focused
            ? colors.blue
            : colors.textMuted
        }
        strokeWidth={
          focused ? 2.3 : 1.9
        }
      />
    </View>
  );
}

/**
 * TASK 20 — three tabs only.
 * Everything else lives in the root stack.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:
          colors.blue,
        tabBarInactiveTintColor:
          colors.textMuted,
        tabBarStyle:
          styles.tabBar,
        tabBarLabelStyle:
          styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              name="dashboard"
              focused={focused}
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
            <TabIcon
              name="apps"
              focused={focused}
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
            <TabIcon
              name="settings"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({

  tabBar: {
    height: 64,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor:
      colors.surfaceGlass,
    borderTopColor: colors.border,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 26,
  },

  pill: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor:
      colors.infoSoft,
  },
});