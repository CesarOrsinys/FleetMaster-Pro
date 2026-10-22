import fs from 'fs';
import path from 'path';
import { ITrafficFineRepository } from '../../../core/ports/ITrafficFineRepository.js';
import { TrafficFine, TrafficFineSchema, FineStatus } from '../../../core/domain/TrafficFine.js';

export class JsonTrafficFineRepository implements ITrafficFineRepository {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'mock_data', 'traffic_fines.json');
  }

  private inMemoryFines: TrafficFine[] | null = null;

  private readData(): TrafficFine[] {
    if (this.inMemoryFines) return this.inMemoryFines;
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf-8');
      this.inMemoryFines = JSON.parse(content);
      return this.inMemoryFines || [];
    } catch {
      return [];
    }
  }

  private writeData(data: TrafficFine[]): void {
    this.inMemoryFines = data;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[JsonTrafficFineRepository] Filesystem read-only, updated in-memory state:', (e as Error).message);
    }
  }

  async findByTenant(tenantId: string): Promise<TrafficFine[]> {
    const list = this.readData();
    return list.filter(f => f.tenantId === tenantId);
  }

  async findByVehicle(tenantId: string, vehicleId: string): Promise<TrafficFine[]> {
    const list = this.readData();
    return list.filter(f => f.tenantId === tenantId && f.vehicleId === vehicleId);
  }

  async findById(tenantId: string, id: string): Promise<TrafficFine | null> {
    const list = this.readData();
    return list.find(f => f.tenantId === tenantId && f.id === id) || null;
  }

  async create(fine: Omit<TrafficFine, 'id' | 'createdAt'>): Promise<TrafficFine> {
    const list = this.readData();
    const newFine: TrafficFine = {
      ...fine,
      id: `fine_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    TrafficFineSchema.parse(newFine);
    list.push(newFine);
    this.writeData(list);
    return newFine;
  }

  async updateStatus(tenantId: string, id: string, status: FineStatus): Promise<TrafficFine> {
    const list = this.readData();
    const idx = list.findIndex(f => f.tenantId === tenantId && f.id === id);
    if (idx === -1) throw new Error(`Fine ${id} not found for tenant ${tenantId}`);
    list[idx].status = status;
    TrafficFineSchema.parse(list[idx]);
    this.writeData(list);
    return list[idx];
  }
}
