import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    hostId: z
      .string({
        error: (issue) =>
          issue.input === undefined ? 'hostId is required' : 'Invalid hostId format',
      })
      .min(1, 'hostId cannot be empty'),

    maxPlayers: z
      .number()
      .int('maxPlayers must be an integer')
      .min(2, 'Minimum 2 players required')
      .max(12, 'Maximum 12 players allowed')
      .optional(),

    drawTime: z
      .number()
      .int('drawTime must be an integer')
      .min(30, 'Draw time must be at least 30 seconds')
      .max(180, 'Draw time cannot exceed 180 seconds')
      .optional(),

    rounds: z
      .number()
      .int('rounds must be an integer')
      .min(1, 'Must have at least 1 round')
      .max(10, 'Cannot exceed 10 rounds')
      .optional(),
  }),
});

export type CreateRoomSchemaInput = z.infer<typeof createRoomSchema>['body'];