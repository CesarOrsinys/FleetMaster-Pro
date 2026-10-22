import { Vehicle } from '../domain/Vehicle.js';

export interface IVehicleRepository {
  findByTenant(tenantId: string): Promise<Vehicle[]>;
  findById(tenantId: string, id: string): Promise<Vehicle | null>;
  findByPlate(tenantId: string, plate: string): Promise<Vehicle | null>;
  create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
  update(tenantId: string, id: string, updates: Partial<Vehicle>): Promise<Vehicle>;
  delete(tenantId: string, id: string): Promise<boolean>;
}
