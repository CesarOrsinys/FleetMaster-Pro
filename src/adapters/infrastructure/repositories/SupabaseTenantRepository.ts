import { ITenantRepository } from '../../../core/ports/ITenantRepository.js';
import { Tenant } from '../../../core/domain/Tenant.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';
import { JsonTenantRepository } from './JsonTenantRepository.js';

export class SupabaseTenantRepository implements ITenantRepository {
  private fallbackJsonRepo = new JsonTenantRepository();

  private getClient() {
    return getSupabaseClient();
  }

  async findAll(): Promise<Tenant[]> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('tenants').select('*');
        if (!error && data && data.length > 0) {
          return data.map(this.mapFromDb);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTenantRepository] findAll fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findAll();
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('tenants').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTenantRepository] findById fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findById(id);
  }

  async findByCode(code: string): Promise<Tenant | null> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('tenants').select('*').ilike('code', code).maybeSingle();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTenantRepository] findByCode fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByCode(code);
  }

  async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('tenants').insert({
          code: tenant.code,
          name: tenant.name,
          cif: tenant.cif,
          logo_url: tenant.logoUrl,
          primary_color: tenant.primaryColor,
          active: tenant.active
        }).select().single();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTenantRepository] create fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.create(tenant);
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    try {
      const client = this.getClient();
      if (client) {
        const dbPayload: any = {};
        if (updates.name !== undefined) dbPayload.name = updates.name;
        if (updates.cif !== undefined) dbPayload.cif = updates.cif;
        if (updates.logoUrl !== undefined) dbPayload.logo_url = updates.logoUrl;
        if (updates.primaryColor !== undefined) dbPayload.primary_color = updates.primaryColor;
        if (updates.active !== undefined) dbPayload.active = updates.active;

        const { data, error } = await client.from('tenants').update(dbPayload).eq('id', id).select().single();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseTenantRepository] update fallback:', (err as Error).message);
    }
    return this.fallbackJsonRepo.update(id, updates);
  }

  private mapFromDb(row: any): Tenant {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      cif: row.cif,
      logoUrl: row.logo_url,
      primaryColor: row.primary_color,
      active: row.active ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
