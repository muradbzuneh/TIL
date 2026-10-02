import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { permissionService } from '@/services/permission';
import {
  installedAppsService,
  type InstalledApp,
} from '@/services/app';

export default function AndroidTestScreen() {
  const [usageAccess, setUsageAccess] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(false);

  function refreshPermissions() {
    const status = permissionService.getPermissionStatus();

    setUsageAccess(status.usageAccess);
    setOverlay(status.overlay);
  }

  function openUsageSettings() {
    permissionService.openUsageAccessSettings();
  }

  function openOverlaySettings() {
    permissionService.openOverlaySettings();
  }

  function loadInstalledApps() {
    try {
      setLoading(true);

      const result =
        installedAppsService.getInstalledApps();

      setApps(result);
    } catch (error) {
      console.error(
        'Failed to load installed apps:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to read installed applications.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          TIL Android Test
        </Text>

        <Text style={styles.subtitle}>
          Task 3 native services
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Permissions
        </Text>

        <View style={styles.statusRow}>
          <Text>Usage Access</Text>

          <Text
            style={[
              styles.status,
              usageAccess
                ? styles.granted
                : styles.denied,
            ]}
          >
            {usageAccess ? 'Granted' : 'Not granted'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text>Display Over Other Apps</Text>

          <Text
            style={[
              styles.status,
              overlay
                ? styles.granted
                : styles.denied,
            ]}
          >
            {overlay ? 'Granted' : 'Not granted'}
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={openUsageSettings}
        >
          <Text style={styles.buttonText}>
            Open Usage Access Settings
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={openOverlaySettings}
        >
          <Text style={styles.buttonText}>
            Open Overlay Settings
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={refreshPermissions}
        >
          <Text style={styles.secondaryButtonText}>
            Refresh Permission Status
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.appsHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Installed Apps
            </Text>

            <Text style={styles.count}>
              {apps.length} launchable apps
            </Text>
          </View>

          <Pressable
            style={[
              styles.smallButton,
              loading && styles.disabled,
            ]}
            disabled={loading}
            onPress={loadInstalledApps}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Load'}
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={apps}
          keyExtractor={(item) => item.packageName}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.appRow}>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>
                  {item.appName}
                </Text>

                <Text style={styles.packageName}>
                  {item.packageName}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Press &quot;Load&quot; to discover installed apps.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 4,
    color: '#64748B',
  },

  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  status: {
    fontWeight: '700',
  },

  granted: {
    color: '#16A34A',
  },

  denied: {
    color: '#DC2626',
  },

  button: {
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#208AEF',
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  secondaryButton: {
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#334155',
    fontWeight: '600',
  },

  appsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  count: {
    color: '#64748B',
    marginTop: -8,
  },

  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#208AEF',
  },

  disabled: {
    opacity: 0.5,
  },

  list: {
    paddingTop: 12,
  },

  appRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  appInfo: {
    flex: 1,
  },

  appName: {
    fontSize: 15,
    fontWeight: '600',
  },

  packageName: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  empty: {
    paddingVertical: 20,
    color: '#64748B',
    textAlign: 'center',
  },
});