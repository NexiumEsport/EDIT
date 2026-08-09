import { z } from 'zod'

export const createCalendarEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  start_at: z.string().datetime({ offset: true }),
  end_at: z.string().datetime({ offset: true }).optional(),
  category: z.string().max(50).optional(),
})

export const deleteCalendarEventSchema = z.object({
  id: z.string().uuid(),
})