import { z } from 'zod';
import { Role } from '@prisma/client';

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Role must be either USER or ADMIN' }) }),
  }),
});
