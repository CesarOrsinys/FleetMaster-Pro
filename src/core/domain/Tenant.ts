import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(2),
  name: z.string().min(2),
  cif: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string().default('#0F766E'),
  active: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type Tenant = z.infer<typeof TenantSchema>;
