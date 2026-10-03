import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import {
  BodyText,
  Card,
  CardHeader,
} from '@/components/Card';
import {
  Button,
} from '@/components/Button';
import { Icon } from '@/components/Icon';
import {
  StackHeader,
} from '@/components/StackHeader';

import { useDatabase } from '@/db/useDatabase';
import { getGlobalSettings } from '@/db/repositories';

import type { GlobalSettings } from '@/db/repositories';

import {
  disableGlobalLimit,
  setGlobalLimit,
} from '@/feature/limits/globalLimitService';

import {
  colors,
  radius,
  spacing,
} from '@/theme';

import { formatDuration } from '@/utils/time';

export default function GlobalLimitScreen() {

  const db = useDatabase();

  const [
    settings,
    setSettings,
  ] = useState<GlobalSettings | null>(
    null
  );

  const [
    hours,
    setHours,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const load =
    useCallback(
      () => {

        return getGlobalSettings(db)

          .then((result) => {

            setSettings(result);

            setHours(
              result.isEnabled
                ? String(
                    Math.round(
                      result.dailyLimitSeconds /
                        3600
                    )
                  )
                : ''
            );
          })

          .catch((err) => {

            console.error(
              'Global limit load failed:',
              err
            );

            setError(
              'Unable to load the global limit.'
            );
          });
      },
      [db]
    );

  useEffect(() => {

    load();

  }, [load]);

  const handleSave = () => {

    const value = Number(hours);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      setError(
        'Enter how many hours the combined limit should be.'
      );

      return;
    }

    setError(null);
    setSaving(true);

    setGlobalLimit(db, value * 3600)

      .then(() => {

        setSettings(
          (previous) =>
            previous
              ? {
                  ...previous,
                  isEnabled: true,
                  dailyLimitSeconds:
                    value * 3600,
                }
              : previous
        );
      })

      .catch((err) => {

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to save the limit.'
        );
      })

      .finally(() => {

        setSaving(false);
      });
  };

  const handleToggle = (
    enabled: boolean
  ) => {

    if (!settings) {
      return;
    }

    if (!enabled) {
      setSaving(true);

      disableGlobalLimit(db)

        .then(() => {

          setSettings(
            (previous) =>
              previous
                ? {
                    ...previous,
                    isEnabled: false,
                  }
                : previous
          );
        })

        .finally(() => {

          setSaving(false);
        });

      return;
    }

    handleSave();
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: 40,
        }}
      >
        <StackHeader
          title="Global limit"
          subtitle="One combined budget for all apps"
        />

        <Card>
          <CardHeader
            icon={
              <Icon
                name="limit"
                size={16}
                color={colors.blue}
              />
            }
            title="Combined daily limit"
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent:
                'space-between',
              marginTop: 14,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              {settings?.isEnabled
                ? 'Enabled'
                : 'Disabled'}
            </Text>

            <Switch
              value={
                settings?.isEnabled ??
                false
              }
              disabled={saving}
              onValueChange={handleToggle}
            />
          </View>

          <BodyText
            text="When enabled, TIL adds up the usage of every tracked app and compares it to this single daily budget."
          />
        </Card>

        <Card
          style={{
            marginTop: spacing.md,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.9,
            }}
          >
            Hours per day
          </Text>

          <TextInput
            value={hours}
            onChangeText={setHours}
            keyboardType="number-pad"
            placeholder="4"
            placeholderTextColor={
              colors.textMuted
            }
            style={{
              marginTop: 10,
              height: 54,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor:
                colors.surfaceMuted,
              paddingHorizontal: 16,
              fontSize: 20,
              fontWeight: '700',
              color: colors.text,
            }}
          />

          {
            settings?.isEnabled ? (
              <BodyText
                text={`Currently ${formatDuration(
                  settings.dailyLimitSeconds
                )} per day.`}
              />
            ) : null
          }

          {
            error ? (
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.danger,
                }}
              >
                {error}
              </Text>
            ) : null
          }

          <Button
            label="Save limit"
            icon="limit"
            loading={saving}
            onPress={handleSave}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}