import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().optional(),
  category: z.string().max(50).optional(),
})

export const completeTaskSchema = z.object({
  id: z.string().uuid(),
})

export const deleteTaskSchema = z.object({
  id: z.string().uuid(),
})