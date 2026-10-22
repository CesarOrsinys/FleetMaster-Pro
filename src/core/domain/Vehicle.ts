import { z } from 'zod';

export const FuelTypeEnum = z.enum(['DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID', 'LPG']);
export type FuelType = z.infer<typeof FuelTypeEnum>;

export const VehicleStatusEnum = z.enum(['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']);
export type VehicleStatus = z.infer<typeof VehicleStatusEnum>;

export const VehicleSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  licensePlate: z.string().min(4).max(20),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1980).max(2100),
  vin: z.string().optional().nullable(),
  fuelType: FuelTypeEnum.default('DIESEL'),
  currentOdometerKm: z.number().int().min(0).default(0),
  status: VehicleStatusEnum.default('ACTIVE'),
  assignedDriverId: z.string().optional().nullable(),
  itvExpirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  nextMaintenanceKm: z.number().int().min(0).default(15000),
  nextMaintenanceDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type Vehicle = z.infer<typeof VehicleSchema>;
