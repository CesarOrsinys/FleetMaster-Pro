import { TrafficFine, FineStatus } from '../domain/TrafficFine.js';

export interface ITrafficFineRepository {
  findByTenant(tenantId: string): Promise<TrafficFine[]>;
  findByVehicle(tenantId: string, vehicleId: string): Promise<TrafficFine[]>;
  findById(tenantId: string, id: string): Promise<TrafficFine | null>;
  create(fine: Omit<TrafficFine, 'id' | 'createdAt'>): Promise<TrafficFine>;
  updateStatus(tenantId: string, id: string, status: FineStatus): Promise<TrafficFine>;
}
