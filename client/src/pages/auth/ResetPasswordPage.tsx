import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validation/auth.schema';
import { authApi } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/errors';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const mutation = useMutation({
    mutationFn: ({ password }: ResetPasswordFormValues) => {
      if (!token) throw new Error('Reset link is missing its token — request a new one.');
      return authApi.resetPassword(token, password);
    },
    onSuccess: () => {
      toast.success('Password reset — sign in with your new password');
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not reset your password'));
    },
  });

  if (!token) {
    return (
      <AuthLayout>
        <Card className="border-0 shadow-none lg:border lg:border-line">
          <CardHeader>
            <CardTitle>Link expired or invalid</CardTitle>
            <CardDescription>This reset link is missing its token.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/forgot-password">
              <Button className="w-full">Request a new link</Button>
            </Link>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-none lg:border lg:border-line">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Resetting your password signs you out everywhere else, too.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
            <FormField label="New password" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
            </FormField>
            <FormField
              label="Confirm new password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
            </FormField>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
