import { User, SafeUser } from '../domain/User.js';

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByTenant(tenantId: string): Promise<SafeUser[]>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateLastLogin(id: string): Promise<void>;
}
