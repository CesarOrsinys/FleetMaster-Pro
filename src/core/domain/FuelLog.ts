import { z } from 'zod';

export const FuelLogSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  odometerKm: z.number().int().min(0),
  liters: z.number().positive(),
  costEur: z.number().positive(),
  fuelStation: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  fullTank: z.boolean().optional().nullable(),
  createdAt: z.string().optional()
});

export type FuelLog = z.infer<typeof FuelLogSchema>;
