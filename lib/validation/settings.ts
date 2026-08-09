import { z } from 'zod'

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().max(100).optional(),
  timezone: z.string().min(1).max(100),
})