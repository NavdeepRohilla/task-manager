import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validation/auth.schema';
import { authApi } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/errors';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: ({ email }: ForgotPasswordFormValues) => authApi.forgotPassword(email),
  });

  return (
    <AuthLayout>
      <Card className="border-0 shadow-none lg:border lg:border-line">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>We'll send a reset link if that email has an account.</CardDescription>
        </CardHeader>
        <CardContent>
          {mutation.isSuccess ? (
            <div className="rounded-sm border border-line bg-flap px-4 py-3 text-sm text-ink">
              If <span className="font-medium">{mutation.variables?.email}</span> has an account, a reset link is on
              its way. Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
              <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
              </FormField>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Sending…' : 'Send reset link'}
              </Button>
              {mutation.isError && <p className="text-sm text-danger">{getErrorMessage(mutation.error)}</p>}
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted">
            <Link to="/login" className="font-medium text-ink hover:text-signal-dark">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
