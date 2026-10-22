import { ITenantRepository } from '../../../core/ports/ITenantRepository.js';
import { Tenant } from '../../../core/domain/Tenant.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';

export class SupabaseTenantRepository implements ITenantRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client unavailable. Check USE_MOCK_DB and credentials.');
    return client;
  }

  async findAll(): Promise<Tenant[]> {
    const { data, error } = await this.getClient().from('tenants').select('*');
    if (error) throw error;
    return (data || []).map(this.mapFromDb);
  }

  async findById(id: string): Promise<Tenant | null> {
    const { data, error } = await this.getClient().from('tenants').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? this.mapFromDb(data) : null;
  }

  async findByCode(code: string): Promise<Tenant | null> {
    const { data, error } = await this.getClient().from('tenants').select('*').ilike('code', code).maybeSingle();
    if (error) throw error;
    return data ? this.mapFromDb(data) : null;
  }

  async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const { data, error } = await this.getClient().from('tenants').insert({
      code: tenant.code,
      name: tenant.name,
      cif: tenant.cif,
      logo_url: tenant.logoUrl,
      primary_color: tenant.primaryColor,
      active: tenant.active
    }).select().single();
    if (error) throw error;
    return this.mapFromDb(data);
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.logoUrl !== undefined) dbPayload.logo_url = updates.logoUrl;
    if (updates.primaryColor !== undefined) dbPayload.primary_color = updates.primaryColor;
    if (updates.active !== undefined) dbPayload.active = updates.active;
    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await this.getClient().from('tenants').update(dbPayload).eq('id', id).select().single();
    if (error) throw error;
    return this.mapFromDb(data);
  }

  private mapFromDb(row: any): Tenant {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      cif: row.cif,
      logoUrl: row.logo_url,
      primaryColor: row.primary_color || '#0F766E',
      active: row.active ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
