import { MaintenanceRecord } from '../domain/MaintenanceRecord.js';

export interface IMaintenanceRepository {
  findByTenant(tenantId: string): Promise<MaintenanceRecord[]>;
  findByVehicle(tenantId: string, vehicleId: string): Promise<MaintenanceRecord[]>;
  findById(tenantId: string, id: string): Promise<MaintenanceRecord | null>;
  create(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord>;
  update(tenantId: string, id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord>;
}
