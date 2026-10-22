import fs from 'fs';
import path from 'path';
import { IVehicleRepository } from '../../../core/ports/IVehicleRepository.js';
import { Vehicle, VehicleSchema } from '../../../core/domain/Vehicle.js';

export class JsonVehicleRepository implements IVehicleRepository {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'mock_data', 'vehicles.json');
  }

  private inMemoryVehicles: Vehicle[] | null = null;

  private readData(): Vehicle[] {
    if (this.inMemoryVehicles) return this.inMemoryVehicles;
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf-8');
      this.inMemoryVehicles = JSON.parse(content);
      return this.inMemoryVehicles || [];
    } catch {
      return [];
    }
  }

  private writeData(data: Vehicle[]): void {
    this.inMemoryVehicles = data;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[JsonVehicleRepository] Filesystem read-only, updated in-memory state:', (e as Error).message);
    }
  }

  async findByTenant(tenantId: string): Promise<Vehicle[]> {
    const list = this.readData();
    return list.filter(v => v.tenantId === tenantId);
  }

  async findById(tenantId: string, id: string): Promise<Vehicle | null> {
    const list = this.readData();
    return list.find(v => v.tenantId === tenantId && v.id === id) || null;
  }

  async findByPlate(tenantId: string, plate: string): Promise<Vehicle | null> {
    const list = this.readData();
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    return list.find(v => v.tenantId === tenantId && v.licensePlate.replace(/\s+/g, '').toUpperCase() === cleanPlate) || null;
  }

  async create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const list = this.readData();
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    VehicleSchema.parse(newVehicle);
    list.push(newVehicle);
    this.writeData(list);
    return newVehicle;
  }

  async update(tenantId: string, id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const list = this.readData();
    const idx = list.findIndex(v => v.tenantId === tenantId && v.id === id);
    if (idx === -1) throw new Error(`Vehicle ${id} not found in tenant ${tenantId}`);
    const updated = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    VehicleSchema.parse(updated);
    list[idx] = updated;
    this.writeData(list);
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const list = this.readData();
    const initialLen = list.length;
    const filtered = list.filter(v => !(v.tenantId === tenantId && v.id === id));
    if (filtered.length === initialLen) return false;
    this.writeData(filtered);
    return true;
  }
}
