import { z } from 'zod'

export const createReminderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  remind_at: z.string().datetime({ offset: true }),
})

export const deleteReminderSchema = z.object({
  id: z.string().uuid(),
})