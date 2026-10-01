import { z } from 'zod';

export const noteSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1),
  body: z.string(),
  created_at: z.string(),
});

export type Note = z.infer<typeof noteSchema>;

export const noteDraftSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  body: z.string().default(''),
});

export type NoteDraft = z.infer<typeof noteDraftSchema>;
