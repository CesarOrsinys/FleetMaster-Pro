import { IUserRepository } from '../../../core/ports/IUserRepository.js';
import { User, SafeUser } from '../../../core/domain/User.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';

export class SupabaseUserRepository implements IUserRepository {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    return client;
  }

  async findByUsername(username: string): Promise<User | null> {
    const client = this.getClient();
    const { data, error } = await client.from('users').select('*').ilike('username', username).maybeSingle();
    if (error) {
      console.error('[SupabaseUserRepository] findByUsername error:', error.message);
      return null;
    }
    return data ? this.mapFromDb(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const client = this.getClient();
    const { data, error } = await client.from('users').select('*').ilike('email', email).maybeSingle();
    if (error) {
      console.error('[SupabaseUserRepository] findByEmail error:', error.message);
      return null;
    }
    return data ? this.mapFromDb(data) : null;
  }

  async findById(id: string): Promise<User | null> {
    const client = this.getClient();
    const { data, error } = await client.from('users').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('[SupabaseUserRepository] findById error:', error.message);
      return null;
    }
    return data ? this.mapFromDb(data) : null;
  }

  async findByTenant(tenantId: string): Promise<SafeUser[]> {
    const client = this.getClient();
    const { data, error } = await client.from('users').select('*').eq('tenant_id', tenantId);
    if (error) {
      console.error('[SupabaseUserRepository] findByTenant error:', error.message);
      return [];
    }
    return (data || []).map(row => {
      const u = this.mapFromDb(row);
      const { passwordHash, ...safe } = u;
      return safe as SafeUser;
    });
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const client = this.getClient();
    const { data, error } = await client.from('users').insert({
      tenant_id: user.tenantId,
      username: user.username,
      email: user.email,
      password_hash: user.passwordHash,
      full_name: user.fullName,
      role: user.role,
      phone: user.phone,
      license_number: user.licenseNumber,
      active: user.active
    }).select().single();

    if (error || !data) {
      throw new Error(`Failed to create user: ${error?.message}`);
    }
    return this.mapFromDb(data);
  }

  async updateLastLogin(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client.from('users').update({
      last_login_at: new Date().toISOString()
    }).eq('id', id);
    if (error) {
      console.warn('[SupabaseUserRepository] updateLastLogin error:', error.message);
    }
  }

  private mapFromDb(row: any): User {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      role: row.role,
      phone: row.phone,
      licenseNumber: row.license_number,
      active: row.active ?? true,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
