import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { ApiSuccessResponse } from '@/types/api';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // required so the httpOnly refresh cookie is sent/received
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Several requests can 401 at once (e.g. two components fetching in
// parallel right as the access token expires). Sharing one in-flight
// refresh call means we hit /auth/refresh once, not once per request.
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const response = await axios.post<ApiSuccessResponse<{ accessToken: string }>>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  const { accessToken } = response.data.data;
  useAuthStore.getState().setAccessToken(accessToken);
  return accessToken;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    // A 401 only means "the access token expired" if the request actually
    // carried one. Login/register also 401 on bad credentials, but they
    // never send an Authorization header — retrying those via refresh would
    // just mask a wrong-password error as a network hiccup.
    const hadAccessToken = originalRequest?.headers.has('Authorization');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && hadAccessToken) {
      originalRequest._retry = true;

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return api(originalRequest);
      } catch (refreshError) {
        // The refresh token is gone too — there's no session to salvage.
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
