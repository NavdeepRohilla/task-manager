import { z } from 'zod';

// Password rule matches server/src/validators/auth.validator.ts exactly, so
// a form error never gets past the client only to be rejected by the API.
const passwordSchema = z
  .string()
  .min(8, { error: 'Password must be at least 8 characters' })
  .regex(/\d/, { error: 'Password must contain at least one number' });

export const loginSchema = z.object({
  email: z.email({ error: 'Enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' }),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }).max(100, { error: 'Name is too long' }),
  email: z.email({ error: 'Enter a valid email address' }),
  password: passwordSchema,
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Enter a valid email address' }),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
