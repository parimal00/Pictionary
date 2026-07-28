import { z } from 'zod';

export const guestLoginSchema = z.object({
  body: z.object({
    username: z
      .string({
        error: (issue) => issue.input === undefined ? 'Username is required.' : 'Invalid username format.'
      })
      .trim()
      .min(2, 'Username must be at least 2 characters.')
      .max(16, 'Username cannot exceed 16 characters.'),
  }),
});