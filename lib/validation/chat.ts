import { z } from 'zod'

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
})

export const DAILY_MESSAGE_LIMIT = 100