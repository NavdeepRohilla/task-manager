import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, { error: 'Title is required' }).max(200, { error: 'Title is too long' }),
  description: z.string().max(5000, { error: 'Description is too long' }).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  dueDate: z.string().optional(),
  category: z.string().max(100, { error: 'Category is too long' }).optional(),
  // Comma-separated in the UI — parsed into an array right before the API call.
  tagsInput: z.string().optional(),
  assignedUserId: z.string().optional(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;
