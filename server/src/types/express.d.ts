import { Role } from '@prisma/client';

/** The shape `protect` middleware attaches to req.user — reused as a param type across services. */
export interface CurrentUser {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: CurrentUser;
    }
  }
}
