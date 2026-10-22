import fs from 'fs';
import path from 'path';
import { IMaintenanceRepository } from '../../../core/ports/IMaintenanceRepository.js';
import { MaintenanceRecord, MaintenanceRecordSchema } from '../../../core/domain/MaintenanceRecord.js';

export class JsonMaintenanceRepository implements IMaintenanceRepository {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'mock_data', 'maintenance_records.json');
  }

  private readData(): MaintenanceRecord[] {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private writeData(data: MaintenanceRecord[]): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async findByTenant(tenantId: string): Promise<MaintenanceRecord[]> {
    const list = this.readData();
    return list.filter(m => m.tenantId === tenantId);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<MaintenanceRecord[]> {
    const list = this.readData();
    return list.filter(m => m.tenantId === tenantId && m.vehicleId === vehicleId);
  }

  async findById(tenantId: string, id: string): Promise<MaintenanceRecord | null> {
    const list = this.readData();
    return list.find(m => m.tenantId === tenantId && m.id === id) || null;
  }

  async create(record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> {
    const list = this.readData();
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `maint_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    MaintenanceRecordSchema.parse(newRecord);
    list.push(newRecord);
    this.writeData(list);
    return newRecord;
  }

  async update(tenantId: string, id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const list = this.readData();
    const idx = list.findIndex(m => m.tenantId === tenantId && m.id === id);
    if (idx === -1) throw new Error(`Maintenance record ${id} not found in tenant ${tenantId}`);
    const updated = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    MaintenanceRecordSchema.parse(updated);
    list[idx] = updated;
    this.writeData(list);
    return updated;
  }
}
