import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  View,
} from 'react-native';

import { Redirect } from 'expo-router';

import type { Href } from 'expo-router';

import { useDatabase } from '@/db/useDatabase';
import { getGlobalSettings } from '@/db/repositories';

export default function Index() {

  const db =
    useDatabase();

  const [
    target,
    setTarget,
  ] =
    useState<Href | null>(
      null
    );

  useEffect(() => {

    getGlobalSettings(db)

      .then((settings) => {

        setTarget(
          settings.onboardingCompleted
            ? '/(tabs)/dashboard'
            : '/onboarding/welcome'
        );
      })

      .catch((error) => {

        console.error(
          'Startup check failed:',
          error
        );

        setTarget('/(tabs)/dashboard');
      });
  }, [db]);

  if (!target) {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <ActivityIndicator
          style={{
            flex: 1,
          }}
        />
      </View>
    );
  }

  return <Redirect href={target} />;
}