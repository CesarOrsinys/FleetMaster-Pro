import { z } from 'zod';

export const MaintenanceTypeEnum = z.enum([
  'ITV_MOT',
  'OIL_CHANGE',
  'FILTER_REPLACEMENT',
  'BRAKES',
  'TIRES',
  'GENERAL_REPAIR'
]);
export type MaintenanceType = z.infer<typeof MaintenanceTypeEnum>;

export const MaintenanceStatusEnum = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']);
export type MaintenanceStatus = z.infer<typeof MaintenanceStatusEnum>;

export const MaintenanceRecordSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  vehicleId: z.string().min(1),
  type: MaintenanceTypeEnum,
  status: MaintenanceStatusEnum.default('SCHEDULED'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  odometerAtServiceKm: z.number().int().min(0).optional().nullable(),
  costEur: z.number().min(0).default(0),
  workshopName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type MaintenanceRecord = z.infer<typeof MaintenanceRecordSchema>;
