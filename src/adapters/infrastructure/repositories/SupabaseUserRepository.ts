import { IUserRepository } from '../../../core/ports/IUserRepository.js';
import { User, SafeUser } from '../../../core/domain/User.js';
import { getSupabaseClient } from '../services/SupabaseClient.js';
import { JsonUserRepository } from './JsonUserRepository.js';

export class SupabaseUserRepository implements IUserRepository {
  private fallbackJsonRepo = new JsonUserRepository();

  private getClient() {
    return getSupabaseClient();
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('users').select('*').ilike('username', username).maybeSingle();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseUserRepository] findByUsername failed, falling back to mock:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('users').select('*').ilike('email', email).maybeSingle();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseUserRepository] findByEmail failed, falling back to mock:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('users').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseUserRepository] findById failed, falling back to mock:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findById(id);
  }

  async findByTenant(tenantId: string): Promise<SafeUser[]> {
    try {
      const client = this.getClient();
      if (client) {
        const { data, error } = await client.from('users').select('*').eq('tenant_id', tenantId);
        if (!error && data && data.length > 0) {
          return data.map(row => {
            const u = this.mapFromDb(row);
            const { passwordHash, ...safe } = u;
            return safe as SafeUser;
          });
        }
      }
    } catch (err) {
      console.warn('[SupabaseUserRepository] findByTenant failed, falling back to mock:', (err as Error).message);
    }
    return this.fallbackJsonRepo.findByTenant(tenantId);
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const client = this.getClient();
      if (client) {
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
        if (!error && data) {
          return this.mapFromDb(data);
        }
      }
    } catch (err) {
      console.warn('[SupabaseUserRepository] create failed, falling back to mock:', (err as Error).message);
    }
    return this.fallbackJsonRepo.create(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      const client = this.getClient();
      if (client) {
        await client.from('users').update({
          last_login_at: new Date().toISOString()
        }).eq('id', id);
      }
    } catch (err) {
      console.warn('[SupabaseUserRepository] updateLastLogin failed:', (err as Error).message);
    }
    await this.fallbackJsonRepo.updateLastLogin(id);
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
