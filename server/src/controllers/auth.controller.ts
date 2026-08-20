import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { authService } from '../services/auth.service';
import { isProduction } from '../config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';

// httpOnly so client-side JS (and therefore XSS) can never read this cookie.
// Scoped to the /auth path since it's only ever needed by the refresh/logout
// routes, not sent on every API call.
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
};

interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Never spread the raw Prisma user into a response — this is the one
// allowed shape, and it has no `password` field.
const toPublicUser = (user: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register(name, email, password);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  ApiResponse.success(res, 201, 'Account created successfully', {
    user: toPublicUser(user),
    accessToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  ApiResponse.success(res, 200, 'Logged in successfully', {
    user: toPublicUser(user),
    accessToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const incoming = req.cookies?.[REFRESH_COOKIE_NAME];
  const { accessToken, refreshToken } = await authService.refresh(incoming);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  ApiResponse.success(res, 200, 'Token refreshed', { accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const incoming = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logout(incoming);

  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
  ApiResponse.success(res, 200, 'Logged out successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  ApiResponse.success(res, 200, 'If that email exists, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  ApiResponse.success(res, 200, 'Password reset successfully. You can now log in.');
});
