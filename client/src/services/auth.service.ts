import { api } from './api';
import type { ApiSuccessResponse, AuthResult, User } from '@/types/api';

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api
      .post<ApiSuccessResponse<AuthResult>>('/auth/register', { name, email, password })
      .then((res) => res.data.data),

  login: (email: string, password: string) =>
    api.post<ApiSuccessResponse<AuthResult>>('/auth/login', { email, password }).then((res) => res.data.data),

  /** Trades the httpOnly refresh cookie for a fresh access token — used both by the response interceptor and app-load bootstrap. */
  refresh: () => api.post<ApiSuccessResponse<{ accessToken: string }>>('/auth/refresh').then((res) => res.data.data),

  logout: () => api.post<ApiSuccessResponse<null>>('/auth/logout').then((res) => res.data),

  forgotPassword: (email: string) =>
    api.post<ApiSuccessResponse<null>>('/auth/forgot-password', { email }).then((res) => res.data),

  resetPassword: (token: string, password: string) =>
    api.post<ApiSuccessResponse<null>>('/auth/reset-password', { token, password }).then((res) => res.data),

  me: () => api.get<ApiSuccessResponse<User>>('/users/me').then((res) => res.data.data),
};
