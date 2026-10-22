import fs from 'fs';
import path from 'path';
import { ITenantRepository } from '../../../core/ports/ITenantRepository.js';
import { Tenant, TenantSchema } from '../../../core/domain/Tenant.js';

export class JsonTenantRepository implements ITenantRepository {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'mock_data', 'tenants.json');
  }

  private inMemoryTenants: Tenant[] | null = null;

  private readData(): Tenant[] {
    if (this.inMemoryTenants) return this.inMemoryTenants;
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf-8');
      this.inMemoryTenants = JSON.parse(content);
      return this.inMemoryTenants || [];
    } catch {
      return [];
    }
  }

  private writeData(data: Tenant[]): void {
    this.inMemoryTenants = data;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[JsonTenantRepository] Filesystem read-only, updated in-memory state:', (e as Error).message);
    }
  }

  async findAll(): Promise<Tenant[]> {
    return this.readData();
  }

  async findById(id: string): Promise<Tenant | null> {
    const list = this.readData();
    return list.find(t => t.id === id) || null;
  }

  async findByCode(code: string): Promise<Tenant | null> {
    const list = this.readData();
    return list.find(t => t.code.toLowerCase() === code.toLowerCase()) || null;
  }

  async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const list = this.readData();
    const newTenant: Tenant = {
      ...tenant,
      id: `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    TenantSchema.parse(newTenant);
    list.push(newTenant);
    this.writeData(list);
    return newTenant;
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const list = this.readData();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Tenant ${id} not found`);
    const updated = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    TenantSchema.parse(updated);
    list[idx] = updated;
    this.writeData(list);
    return updated;
  }
}
