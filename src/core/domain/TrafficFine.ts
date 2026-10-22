import { z } from 'zod';

export const FineStatusEnum = z.enum(['PENDING', 'PAID', 'APPEALED']);
export type FineStatus = z.infer<typeof FineStatusEnum>;

export const TrafficFineSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  reason: z.string().min(3),
  amountEur: z.number().min(0.01),
  status: FineStatusEnum.default('PENDING'),
  fineReference: z.string().optional().nullable(),
  organism: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional()
});

export type TrafficFine = z.infer<typeof TrafficFineSchema>;
