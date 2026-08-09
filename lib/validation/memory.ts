import { z } from 'zod'

export const rememberFactSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(500),
  category: z.string().max(50).optional(),
})

export const deleteMemorySchema = z.object({
  id: z.string().uuid(),
})