import { ITenantRepository } from '../../../core/ports/ITenantRepository.js';
import { Tenant } from '../../../core/domain/Tenant.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';

export class SupabaseTenantRepository implements ITenantRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    return client;
  }

  async findAll(): Promise<Tenant[]> {
    const client = this.getClient();
    const { data, error } = await client.from('tenants').select('*').order('name', { ascending: true });
    if (error) {
      console.error('[SupabaseTenantRepository] findAll error:', error.message);
      return [];
    }
    return (data || []).map(this.mapFromDb);
  }

  async findById(id: string): Promise<Tenant | null> {
    const client = this.getClient();
    const { data, error } = await client.from('tenants').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('[SupabaseTenantRepository] findById error:', error.message);
      return null;
    }
    return data ? this.mapFromDb(data) : null;
  }

  async findByCode(code: string): Promise<Tenant | null> {
    const client = this.getClient();
    const { data, error } = await client.from('tenants').select('*').ilike('code', code).maybeSingle();
    if (error) {
      console.error('[SupabaseTenantRepository] findByCode error:', error.message);
      return null;
    }
    return data ? this.mapFromDb(data) : null;
  }

  async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const client = this.getClient();
    const { data, error } = await client.from('tenants').insert({
      code: tenant.code,
      name: tenant.name,
      cif: tenant.cif,
      logo_url: tenant.logoUrl,
      primary_color: tenant.primaryColor,
      active: tenant.active
    }).select().single();

    if (error || !data) {
      throw new Error(`Failed to create tenant: ${error?.message}`);
    }
    return this.mapFromDb(data);
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const client = this.getClient();
    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.cif !== undefined) dbPayload.cif = updates.cif;
    if (updates.logoUrl !== undefined) dbPayload.logo_url = updates.logoUrl;
    if (updates.primaryColor !== undefined) dbPayload.primary_color = updates.primaryColor;
    if (updates.active !== undefined) dbPayload.active = updates.active;

    const { data, error } = await client.from('tenants').update(dbPayload).eq('id', id).select().single();
    if (error || !data) {
      throw new Error(`Failed to update tenant: ${error?.message}`);
    }
    return this.mapFromDb(data);
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
