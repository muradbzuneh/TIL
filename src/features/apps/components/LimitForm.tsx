import {
  Controller,
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  limitInputSchema,
  type LimitInputForm,
} from '@/features/apps/appManagementSchema';

type Props = {
  initialValue?: LimitInputForm;

  submitLabel?: string;

  onSubmit: (
    value: LimitInputForm
  ) => void;

  onCancel?: () => void;
};

const defaultValues: LimitInputForm = {
  days: 0,
  hours: 1,
  minutes: 0,
  seconds: 0,
};

export default function LimitForm({
  initialValue =
    defaultValues,

  submitLabel =
    'Continue',

  onSubmit,

  onCancel,
}: Props) {

  const {
    control,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<LimitInputForm>({
    resolver:
      zodResolver(
        limitInputSchema
      ),

    defaultValues:
      initialValue,
  });

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Daily Time Limit
      </Text>

      <Text style={styles.description}>
        Choose how much time you want
        to allow this app each day.
      </Text>

      <View style={styles.row}>

        <LimitField
          control={control}
          name="days"
          label="Days"
          error={
            errors.days?.message
          }
        />

        <LimitField
          control={control}
          name="hours"
          label="Hours"
          error={
            errors.hours?.message
          }
        />

        <LimitField
          control={control}
          name="minutes"
          label="Minutes"
          error={
            errors.minutes?.message
          }
        />

        <LimitField
          control={control}
          name="seconds"
          label="Seconds"
          error={
            errors.seconds?.message
          }
        />

      </View>

      {errors.minutes?.message && (
        <Text style={styles.error}>
          {errors.minutes.message}
        </Text>
      )}

      <View style={styles.actions}>

        {onCancel && (
          <Pressable
            style={[
              styles.button,
              styles.cancelButton,
            ]}
            onPress={onCancel}
          >
            <Text
              style={
                styles.cancelText
              }
            >
              Cancel
            </Text>
          </Pressable>
        )}

        <Pressable
          style={[
            styles.button,
            styles.primaryButton,
          ]}
          onPress={handleSubmit(
            onSubmit
          )}
        >
          <Text
            style={
              styles.primaryText
            }
          >
            {submitLabel}
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

type LimitFieldProps = {
  control: any;
  name:
    | 'days'
    | 'hours'
    | 'minutes'
    | 'seconds';
  label: string;
  error?: string;
};

function LimitField({
  control,
  name,
  label,
  error,
}: LimitFieldProps) {

  return (
    <View style={styles.field}>

      <Text style={styles.label}>
        {label}
      </Text>

      <Controller
        control={control}
        name={name}
        render={({
          field: {
            onChange,
            value,
          },
        }) => (
          <TextInput
            value={String(
              value ?? ''
            )}
            onChangeText={(
              text
            ) => {
              const cleaned =
                text.replace(
                  /[^0-9]/g,
                  ''
                );

              onChange(
                cleaned === ''
                  ? 0
                  : Number(cleaned)
              );
            }}
            keyboardType="number-pad"
            style={[
              styles.input,
              error &&
                styles.inputError,
            ]}
            maxLength={2}
          />
        )}
      />

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      width: '100%',
    },

    title: {
      fontSize: 22,
      fontWeight: '800',
      color: '#0F172A',
    },

    description: {
      marginTop: 6,
      lineHeight: 20,
      color: '#64748B',
    },

    row: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 20,
    },

    field: {
      flex: 1,
    },

    label: {
      marginBottom: 6,
      fontSize: 12,
      fontWeight: '600',
      color: '#64748B',
    },

    input: {
      height: 48,
      borderWidth: 1,
      borderColor: '#CBD5E1',
      borderRadius: 12,
      paddingHorizontal: 10,
      textAlign: 'center',
      fontSize: 17,
      color: '#0F172A',
      backgroundColor: '#FFFFFF',
    },

    inputError: {
      borderColor: '#DC2626',
    },

    error: {
      marginTop: 8,
      color: '#DC2626',
      fontSize: 13,
    },

    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 24,
    },

    button: {
      minHeight: 48,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },

    primaryButton: {
      backgroundColor: '#208AEF',
    },

    cancelButton: {
      backgroundColor: '#E2E8F0',
    },

    primaryText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    cancelText: {
      color: '#334155',
      fontWeight: '700',
    },
  });