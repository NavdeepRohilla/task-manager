import { Role, UserModel } from '@prisma/client';
import { prisma } from '../config/prisma';

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export type PublicUserRecord = Omit<UserModel, 'password'>;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Repository layer: the only place that imports `prisma` for User records.
 * Services depend on this interface, not on Prisma directly, so the ORM
 * could be swapped later without touching business logic.
 */
export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  create: (data: CreateUserInput) => prisma.user.create({ data }),

  updatePassword: (id: string, password: string) =>
    prisma.user.update({ where: { id }, data: { password } }),

  /** Admin-facing list — never includes password hashes. */
  findMany: (skip: number, take: number): Promise<PublicUserRecord[]> =>
    prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),

  /** Used by the assignee picker — any authenticated user can search teammates by name/email. */
  search: (query: string | undefined, take: number): Promise<PublicUserRecord[]> =>
    prisma.user.findMany({
      select: publicUserSelect,
      where: query
        ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }] }
        : undefined,
      orderBy: { name: 'asc' },
      take,
    }),

  count: (): Promise<number> => prisma.user.count(),

  updateRole: (id: string, role: Role): Promise<PublicUserRecord> =>
    prisma.user.update({ where: { id }, data: { role }, select: publicUserSelect }),

  deleteById: (id: string): Promise<void> => prisma.user.delete({ where: { id } }).then(() => undefined),
};
