import fs from 'fs';
import path from 'path';
import { IFuelLogRepository } from '../../../core/ports/IFuelLogRepository.js';
import { FuelLog, FuelLogSchema } from '../../../core/domain/FuelLog.js';

export class JsonFuelLogRepository implements IFuelLogRepository {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'mock_data', 'fuel_mileage_logs.json');
  }

  private inMemoryLogs: FuelLog[] | null = null;

  private readData(): FuelLog[] {
    if (this.inMemoryLogs) return this.inMemoryLogs;
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf-8');
      this.inMemoryLogs = JSON.parse(content);
      return this.inMemoryLogs || [];
    } catch {
      return [];
    }
  }

  private writeData(data: FuelLog[]): void {
    this.inMemoryLogs = data;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[JsonFuelLogRepository] Filesystem read-only, updated in-memory state:', (e as Error).message);
    }
  }

  async findByTenant(tenantId: string): Promise<FuelLog[]> {
    const list = this.readData();
    return list.filter(f => f.tenantId === tenantId);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<FuelLog[]> {
    const list = this.readData();
    return list.filter(f => f.tenantId === tenantId && f.vehicleId === vehicleId);
  }

  async create(log: Omit<FuelLog, 'id' | 'createdAt'>): Promise<FuelLog> {
    const list = this.readData();
    const newLog: FuelLog = {
      ...log,
      id: `fuel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    FuelLogSchema.parse(newLog);
    list.push(newLog);
    this.writeData(list);
    return newLog;
  }
}
