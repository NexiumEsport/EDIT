import { z } from 'zod'

export const addShoppingItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().max(50).optional(),
})