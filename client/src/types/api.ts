export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
}

/** Minimal user shape embedded in task owner/assignee, comment author, and the assignee-search results. */
export interface PublicUserRef {
  id: string;
  name: string;
  email: string;
}

/** Fuller shape returned by the admin user-management endpoints. */
export interface PublicUserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: ApiErrorDetail[];
}
