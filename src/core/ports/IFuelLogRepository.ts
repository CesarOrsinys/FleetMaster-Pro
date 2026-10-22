import { FuelLog } from '../domain/FuelLog.js';

export interface IFuelLogRepository {
  findByTenant(tenantId: string): Promise<FuelLog[]>;
  findByVehicle(tenantId: string, vehicleId: string): Promise<FuelLog[]>;
  create(log: Omit<FuelLog, 'id' | 'createdAt'>): Promise<FuelLog>;
}
