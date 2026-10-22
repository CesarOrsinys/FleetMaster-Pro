import { z } from 'zod';

export const UserRoleEnum = z.enum(['SUPERADMIN', 'TENANT_ADMIN', 'DRIVER']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const UserSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().nullable().optional(),
  username: z.string().min(3),
  email: z.string().email(),
  passwordHash: z.string(),
  fullName: z.string().min(2),
  role: UserRoleEnum.default('DRIVER'),
  phone: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  active: z.boolean().default(true),
  lastLoginAt: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type User = z.infer<typeof UserSchema>;

export type SafeUser = Omit<User, 'passwordHash'>;
