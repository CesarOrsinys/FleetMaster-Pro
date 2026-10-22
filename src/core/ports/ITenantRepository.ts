import { Tenant } from '../domain/Tenant.js';

export interface ITenantRepository {
  findAll(): Promise<Tenant[]>;
  findById(id: string): Promise<Tenant | null>;
  findByCode(code: string): Promise<Tenant | null>;
  create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
  update(id: string, updates: Partial<Tenant>): Promise<Tenant>;
}
