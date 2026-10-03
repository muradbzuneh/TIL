import { z } from 'zod';

export const limitInputSchema = z.object({
  days: z.number()
    .int()
    .min(0)
    .max(30),

  hours: z.number()
    .int()
    .min(0)
    .max(23),

  minutes: z.number()
    .int()
    .min(0)
    .max(59),

  seconds: z.number()
    .int()
    .min(0)
    .max(59),
})
.refine(
  (value) =>
    value.days > 0 ||
    value.hours > 0 ||
    value.minutes > 0 ||
    value.seconds > 0,
  {
    message:
      'Daily limit must be greater than zero.',
    path: ['minutes'],
  }
);

export const manualAppSchema =
  z.object({
    appName: z
      .string()
      .trim()
      .min(
        1,
        'App name is required.'
      )
      .max(
        80,
        'App name is too long.'
      ),
  });

export type LimitInputForm =
  z.infer<typeof limitInputSchema>;

export type ManualAppForm =
  z.infer<typeof manualAppSchema>;