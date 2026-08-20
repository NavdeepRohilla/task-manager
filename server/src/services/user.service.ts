import { userRepository, PublicUserRecord } from '../repositories/user.repository';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const userService = {
  /** Admin-facing paginated list. */
  listUsers: async (page: number, limit: number): Promise<{ users: PublicUserRecord[]; pagination: PaginationMeta }> => {
    const [users, total] = await Promise.all([
      userRepository.findMany((page - 1) * limit, limit),
      userRepository.count(),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  },

  /** Any authenticated user — used by the assignee picker. Capped, not paginated (it's a typeahead, not a table). */
  searchUsers: (query: string | undefined): Promise<PublicUserRecord[]> => userRepository.search(query, 20),
};
